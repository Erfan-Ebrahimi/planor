import { isValidJalaaliDate, jalaaliMonthLength, toGregorian, toJalaali } from 'jalaali-js'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import fa from '../lang/fa.js'

export const timeZone = 'Asia/Tehran'

const dayMilliseconds = 86_400_000
const warningMilliseconds = 14 * dayMilliseconds
const maximumTimeout = 2_147_483_647
const number = new Intl.NumberFormat('fa-IR-u-nu-arabext', { useGrouping: false })
const paddedNumber = new Intl.NumberFormat('fa-IR-u-nu-arabext', {
  useGrouping: false,
  minimumIntegerDigits: 2,
})
const relativeTime = new Intl.RelativeTimeFormat('fa-IR-u-nu-arabext')
const tehranParts = new Intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn', {
  timeZone,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
})

const minimumYear = 1
const maximumYear = 3177

function timestamp(value) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return typeof value === 'string' ? Date.parse(value) : NaN
}

function gregorianParts(value) {
  const parts = tehranParts.formatToParts(value)
  return Object.fromEntries(parts.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)]))
}

function dateKey({ year, month, day }) {
  return year * 10000 + month * 100 + day
}

function validDate(year, month, day) {
  return [year, month, day].every(Number.isInteger)
    && year >= minimumYear && year <= maximumYear
    && isValidJalaaliDate(year, month, day)
}

function calendarDate(year, month, day) {
  const { gy, gm, gd } = toGregorian(year, month, day)
  return new Date(Date.UTC(gy, gm - 1, gd))
}

function readableDate(value) {
  const { jy: year, jm: month, jd: day } = toJalaali(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate())
  return validDate(year, month, day) ? { year, month, day, key: dateKey({ year, month, day }) } : null
}

export function toJalali(value = Date.now()) {
  const instant = timestamp(value)
  const utcYear = new Date(instant).getUTCFullYear()
  if (!(utcYear >= 621 && utcYear <= 3799)) return null
  const { year: gy, month: gm, day: gd, hour, minute } = gregorianParts(instant)
  if (gy < 622 || gy > 3799) return null
  try {
    const { jy: year, jm: month, jd: day } = toJalaali(gy, gm, gd)
    return validDate(year, month, day) ? { year, month, day, hour, minute, key: dateKey({ year, month, day }) } : null
  } catch (error) {
    if (error instanceof RangeError) return null
    throw error
  }
}

function tehranOffset(instant) {
  const { year, month, day, hour, minute, second } = gregorianParts(instant)
  return Date.UTC(year, month - 1, day, hour, minute, second) - instant
}

export function fromJalali({ year, month, day, hour = 0, minute = 0 } = {}) {
  if (!validDate(year, month, day)
    || ![hour, minute].every(Number.isInteger)
    || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null

  const { gy, gm, gd } = toGregorian(year, month, day)
  const midnight = Date.UTC(gy, gm - 1, gd)
  const wallTime = midnight + (hour * 60 + minute) * 60_000
  const offsets = new Set([-dayMilliseconds, 0, dayMilliseconds].map((delta) => tehranOffset(wallTime + delta)))
  const candidates = [...offsets].map((offset) => wallTime - offset).filter((instant) => tehranOffset(instant) + instant === wallTime)
  return candidates.length ? new Date(Math.min(...candidates)).toISOString() : null
}

export function normalizeUtcDateTime(value) {
  if (typeof value !== 'string') return null
  const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?Z$/u)
  if (!match) return null
  const [, minute, seconds = '00', fraction = ''] = match
  const canonical = minute + ':' + seconds + '.' + fraction.padEnd(3, '0') + 'Z'
  const instant = Date.parse(canonical)
  if (!Number.isFinite(instant) || new Date(instant).toISOString() !== canonical || !toJalali(instant)) return null
  return canonical
}

export function formatMonth({ year, month }) {
  return fa.date.months[month - 1] + ' ' + number.format(year)
}

export function formatJalaliDay({ day }) {
  return number.format(day)
}

export function formatJalaliDate(date) {
  return formatJalaliDay(date) + ' ' + formatMonth(date)
}

export function formatDate(value) {
  const date = toJalali(value ?? null)
  return date ? formatJalaliDate(date) : ''
}

export function formatDateTime(value) {
  const date = toJalali(value ?? null)
  return date ? formatJalaliDate(date) + fa.date.dateTimeSeparator + formatTimeInput(date) : ''
}

export function formatDateInput({ year, month, day }) {
  return [number.format(year), paddedNumber.format(month), paddedNumber.format(day)].join('/')
}

export function formatTimeInput({ hour, minute }) {
  return paddedNumber.format(hour) + ':' + paddedNumber.format(minute)
}

function latinDigits(value) {
  return value.trim().replace(/[۰-۹٠-٩]/gu, (digit) => String(digit.codePointAt(0) % 16))
}

export function parseDateInput(value) {
  const match = latinDigits(value).match(/^(\d{1,4})([/-])(\d{1,2})\2(\d{1,2})$/u)
  if (!match) return null
  const [year, month, day] = [match[1], match[3], match[4]].map(Number)
  return validDate(year, month, day) ? { year, month, day, key: dateKey({ year, month, day }) } : null
}

export function parseTimeInput(value) {
  const match = latinDigits(value).match(/^(\d{1,2}):(\d{2})$/u)
  if (!match) return null
  const [hour, minute] = match.slice(1).map(Number)
  return hour <= 23 && minute <= 59 ? { hour, minute } : null
}

export function shiftDate(date, amount) {
  const { year, month, day } = date
  const next = new Date(calendarDate(year, month, day).getTime() + amount * dayMilliseconds)
  try {
    return readableDate(next)
  } catch (error) {
    if (error instanceof RangeError) return null
    throw error
  }
}

export function shiftMonth({ year, month, day }, amount) {
  const index = year * 12 + month - 1 + amount
  const nextYear = Math.floor(index / 12)
  const nextMonth = index % 12 + 1
  if (nextYear < minimumYear || nextYear > maximumYear) return null
  const nextDay = Math.min(day, jalaaliMonthLength(nextYear, nextMonth))
  return { year: nextYear, month: nextMonth, day: nextDay, key: dateKey({ year: nextYear, month: nextMonth, day: nextDay }) }
}

export function dayOfWeek({ year, month, day }) {
  return (calendarDate(year, month, day).getUTCDay() + 1) % 7
}

export function getCalendarWeeks({ year, month }) {
  const firstDay = { year, month, day: 1 }
  const start = -dayOfWeek(firstDay)
  return Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => shiftDate(firstDay, start + row * 7 + column)),
  )
}

export function formatRelative(value, now = Date.now()) {
  const delta = timestamp(value) - timestamp(now)
  if (!Number.isFinite(delta)) return ''
  if (Math.abs(delta) < 30_000) return fa.date.justNow
  const units = [
    ['year', 365 * dayMilliseconds],
    ['month', 30 * dayMilliseconds],
    ['day', dayMilliseconds],
    ['hour', 3_600_000],
    ['minute', 60_000],
    ['second', 1000],
  ]
  const [unit, milliseconds] = units.find(([, size]) => Math.abs(delta) >= size)
  return relativeTime.format(Math.trunc(delta / milliseconds), unit)
}

export function isOverdue(value, now = Date.now()) {
  return timestamp(value) < timestamp(now)
}

export function getDueState(value, now = Date.now()) {
  const delta = timestamp(value) - timestamp(now)
  if (!Number.isFinite(delta)) return null
  if (delta < 0) return 'overdue'
  return delta <= warningMilliseconds ? 'close' : 'normal'
}

export function useDueClock(getDeadlines) {
  const now = ref(Date.now())
  let running = false
  let timer

  function refresh() {
    window.clearTimeout(timer)
    now.value = Date.now()
    const upcoming = getDeadlines().flatMap((value) => {
      const due = timestamp(value)
      return [due - warningMilliseconds, due + 1]
    }).filter((boundary) => boundary > now.value)
    // A board left open overnight should offer the new Tehran day when adding a deadline.
    const today = toJalali(now.value)
    const tomorrow = today && shiftDate(today, 1)
    const midnight = tomorrow && fromJalali(tomorrow)
    const nextDay = midnight ? timestamp(midnight) : now.value + 60_000
    const next = Math.min(nextDay, ...upcoming)
    timer = window.setTimeout(refresh, Math.min(next - now.value, maximumTimeout))
  }

  watch(getDeadlines, () => {
    if (running) refresh()
  })
  onMounted(() => {
    running = true
    refresh()
    window.addEventListener('focus', refresh)
  })
  onUnmounted(() => {
    running = false
    window.clearTimeout(timer)
    window.removeEventListener('focus', refresh)
  })

  return now
}
