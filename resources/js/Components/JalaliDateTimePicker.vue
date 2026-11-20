<script setup>
import { computed, nextTick, ref, useId, useTemplateRef } from 'vue'
import fa from '../lang/fa.js'
import {
  dayOfWeek,
  formatDateInput,
  formatDateTime,
  formatJalaliDate,
  formatJalaliDay,
  formatMonth,
  formatTimeInput,
  fromJalali,
  getCalendarWeeks,
  getDueState,
  parseDateInput,
  parseTimeInput,
  shiftDate,
  shiftMonth,
  toJalali,
} from '../composables/useDate.js'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: String, default: null },
  disabled: Boolean,
  completed: Boolean,
  busy: Boolean,
  error: { type: String, default: '' },
  now: { type: [String, Number], default: undefined },
})
const emit = defineEmits(['update:modelValue'])

const pickerId = useId()
const trigger = useTemplateRef('trigger')
const dialog = useTemplateRef('dialog')
const grid = useTemplateRef('grid')
const dateField = useTemplateRef('dateField')
const timeField = useTemplateRef('timeField')
const dateText = ref('')
const timeText = ref('')
const dateError = ref('')
const timeError = ref('')
const today = ref(toJalali(props.now) || toJalali())
const focusedDay = ref(today.value)

const display = computed(() => formatDateTime(props.modelValue))
const dueState = computed(() => props.completed ? 'normal' : getDueState(props.modelValue, props.now))
const selectedDate = computed(() => parseDateInput(dateText.value))
const weeks = computed(() => getCalendarWeeks(focusedDay.value))
const previousMonth = computed(() => shiftMonth(focusedDay.value, -1))
const nextMonth = computed(() => shiftMonth(focusedDay.value, 1))

async function openPicker() {
  if (props.disabled || props.busy || dialog.value?.open) return
  today.value = toJalali(props.now) || toJalali()
  const selected = toJalali(props.modelValue)
  focusedDay.value = selected || today.value
  dateText.value = formatDateInput(focusedDay.value)
  timeText.value = formatTimeInput(selected || { hour: 12, minute: 0 })
  dateError.value = ''
  timeError.value = ''
  await nextTick()
  dialog.value?.showModal()
  dateField.value?.focus()
}

function closePicker() {
  dialog.value?.close()
}

function restoreFocus() {
  trigger.value?.focus()
}

function syncTypedDate() {
  if (selectedDate.value) focusedDay.value = selectedDate.value
}

function chooseDay(day) {
  focusedDay.value = day
  dateText.value = formatDateInput(day)
  dateError.value = ''
}

async function moveCalendarFocus(day) {
  if (!day) return
  focusedDay.value = day
  await nextTick()
  grid.value?.querySelector('[data-date-key="' + day.key + '"]')?.focus()
}

function navigateGrid(event) {
  if (event.isComposing || !event.target.matches('[data-date-key]')) return
  const day = focusedDay.value
  let next
  switch (event.key) {
    case 'ArrowLeft':
      next = shiftDate(day, 1)
      break
    case 'ArrowRight':
      next = shiftDate(day, -1)
      break
    case 'ArrowUp':
      next = shiftDate(day, -7)
      break
    case 'ArrowDown':
      next = shiftDate(day, 7)
      break
    case 'Home':
      next = shiftDate(day, -dayOfWeek(day))
      break
    case 'End':
      next = shiftDate(day, 6 - dayOfWeek(day))
      break
    case 'PageUp':
      next = shiftMonth(day, event.shiftKey ? -12 : -1)
      break
    case 'PageDown':
      next = shiftMonth(day, event.shiftKey ? 12 : 1)
      break
    default:
      return
  }
  event.preventDefault()
  moveCalendarFocus(next)
}

function save() {
  if (props.disabled || props.busy) return
  const date = selectedDate.value
  const time = parseTimeInput(timeText.value)
  dateError.value = date ? '' : fa.date.invalidDate
  timeError.value = time ? '' : fa.date.invalidTime
  if (!date || !time) {
    const invalidField = date ? timeField : dateField
    invalidField.value?.focus()
    return
  }
  const instant = fromJalali({ ...date, ...time })
  if (!instant) {
    timeError.value = fa.date.unavailableTime
    timeField.value?.focus()
    return
  }
  closePicker()
  emit('update:modelValue', instant)
}

function remove() {
  if (props.disabled || props.busy) return
  closePicker()
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="grid min-w-0 gap-1">
    <button
      ref="trigger"
      type="button"
      aria-haspopup="dialog"
      :aria-controls="pickerId"
      :aria-label="disabled ? (display || fa.date.noDate) : (display ? fa.date.editDueDate(display) : fa.date.selectDate)"
      :aria-describedby="error ? pickerId + '-save-error' : undefined"
      :aria-disabled="busy || undefined"
      :aria-busy="busy || undefined"
      :disabled="disabled"
      class="flex min-h-control w-fit max-w-full items-center gap-2 rounded-control border border-subtle bg-input ps-3 pe-3 text-start enabled:hover:border-accent disabled:opacity-70"
      @click="openPicker"
    >
      <AppIcon name="calendar" class="size-icon shrink-0" />
      <span :class="{ 'text-due-over': dueState === 'overdue', 'text-due-close': dueState === 'close' }">
        {{ display || (disabled ? fa.date.noDate : fa.date.selectDate) }}
      </span>
    </button>
    <p v-if="dueState === 'overdue'" class="text-meta text-due-over">{{ fa.date.overdue }}</p>
    <p v-if="error" :id="pickerId + '-save-error'" role="alert" class="text-meta text-auth-error">{{ error }}</p>

    <dialog
      :id="pickerId"
      ref="dialog"
      :aria-labelledby="pickerId + '-heading'"
      class="glass-surface fixed m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-auth-panel overflow-y-auto rounded-panel border border-subtle bg-popup p-4 text-start text-primary shadow-popup"
      @keydown.esc.stop
      @close="restoreFocus"
    >
      <form class="grid gap-4" novalidate @submit.prevent="save">
        <h2 :id="pickerId + '-heading'" class="text-shell-title font-bold">{{ fa.date.dueDate }}</h2>
        <div class="grid grid-cols-2 gap-3">
          <div class="grid min-w-0 content-start gap-1">
            <label :for="pickerId + '-date'" class="text-body text-secondary">{{ fa.date.dateField }}</label>
            <input
              :id="pickerId + '-date'"
              ref="dateField"
              v-model="dateText"
              dir="ltr"
              type="text"
              autocomplete="off"
              :placeholder="fa.date.datePlaceholder"
              :aria-invalid="Boolean(dateError) || undefined"
              :aria-describedby="dateError ? pickerId + '-date-error' : undefined"
              maxlength="10"
              class="h-control w-full rounded-control border border-border bg-input ps-2 pe-2 text-center"
              @input="dateError = ''"
              @blur="syncTypedDate"
            />
            <p v-if="dateError" :id="pickerId + '-date-error'" class="text-meta text-auth-error">{{ dateError }}</p>
          </div>
          <div class="grid min-w-0 content-start gap-1">
            <label :for="pickerId + '-time'" class="text-body text-secondary">{{ fa.date.timeField }}</label>
            <input
              :id="pickerId + '-time'"
              ref="timeField"
              v-model="timeText"
              dir="ltr"
              type="text"
              autocomplete="off"
              :placeholder="fa.date.timePlaceholder"
              :aria-invalid="Boolean(timeError) || undefined"
              :aria-describedby="timeError ? pickerId + '-time-error' : undefined"
              maxlength="5"
              class="h-control w-full rounded-control border border-border bg-input ps-2 pe-2 text-center"
              @input="timeError = ''"
            />
            <p v-if="timeError" :id="pickerId + '-time-error'" class="text-meta text-auth-error">{{ timeError }}</p>
          </div>
        </div>

        <div class="grid gap-2 rounded-control border border-subtle bg-input p-2">
          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              :aria-label="fa.date.previousMonth"
              :disabled="!previousMonth"
              class="grid size-control place-items-center rounded-control enabled:hover:bg-card-hover disabled:opacity-40"
              @click="focusedDay = previousMonth"
            >
              <AppIcon name="chevron" class="size-icon rotate-180" />
            </button>
            <p :id="pickerId + '-month'" aria-live="polite" class="text-center font-bold">
              {{ formatMonth(focusedDay) }}
            </p>
            <button
              type="button"
              :aria-label="fa.date.nextMonth"
              :disabled="!nextMonth"
              class="grid size-control place-items-center rounded-control enabled:hover:bg-card-hover disabled:opacity-40"
              @click="focusedDay = nextMonth"
            >
              <AppIcon name="chevron" class="size-icon" />
            </button>
          </div>
          <table
            ref="grid"
            role="grid"
            :aria-labelledby="pickerId + '-month'"
            class="w-full table-fixed border-separate border-spacing-1 text-center"
            @keydown="navigateGrid"
          >
            <thead>
              <tr>
                <th
                  v-for="(weekday, index) in fa.date.weekdays"
                  :key="weekday"
                  scope="col"
                  :aria-label="weekday"
                  class="pb-1 text-meta font-normal text-secondary"
                >{{ fa.date.shortWeekdays[index] }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(week, index) in weeks" :key="index">
                <td
                  v-for="(day, column) in week"
                  :key="day?.key || column"
                  :aria-selected="day ? day.key === selectedDate?.key : undefined"
                >
                  <button
                    v-if="day"
                    type="button"
                    :data-date-key="day.key"
                    :aria-label="formatJalaliDate(day)"
                    :aria-current="day.key === today.key ? 'date' : undefined"
                    :tabindex="day.key === focusedDay.key ? 0 : -1"
                    class="h-8 w-full rounded-control border border-subtle focus-visible:outline-offset-0"
                    :class="day.key === selectedDate?.key
                      ? 'bg-auth-button font-bold text-on-auth-button'
                      : ['hover:bg-card-hover', day.month !== focusedDay.month ? 'text-muted' : '', day.key === today.key ? 'font-bold text-accent' : '']"
                    @focus="focusedDay = day.month === focusedDay.month ? day : focusedDay"
                    @click="chooseDay(day)"
                  >{{ formatJalaliDay(day) }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-if="modelValue"
            type="button"
            class="rounded-control ps-2 pe-2 py-2 text-auth-error hover:bg-auth-error-surface"
            @click="remove"
          >{{ fa.date.remove }}</button>
          <div class="ms-auto flex flex-wrap gap-2">
            <button type="button" class="rounded-control border border-border ps-3 pe-3 py-2 hover:bg-card-hover" @click="closePicker">
              {{ fa.date.cancel }}
            </button>
            <button type="submit" class="rounded-control bg-auth-button ps-4 pe-4 py-2 font-bold text-on-auth-button hover:brightness-110">
              {{ fa.date.select }}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  </div>
</template>
