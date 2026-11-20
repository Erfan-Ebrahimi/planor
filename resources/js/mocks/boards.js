import { workspacePage } from './workspace.js'

const niloufar = workspacePage.props.viewer
const kamran = { id: 'usr-1011', name: 'کامران یوسفی' }
const leila = { id: 'usr-1012', name: 'لیلا شریفی' }
const arman = { id: 'usr-1013', name: 'آرمان کریمی' }

const list = (id, name, position, collapsed = false) => ({ id, name, position, collapsed })
const task = (id, title, position, completed = false) => ({ id, title, position, completed })
const card = (id, listId, position, title, options = {}) => ({
  id,
  listId,
  position,
  title,
  description: '',
  priority: 'normal',
  assigneeId: null,
  labelIds: [],
  completed: false,
  dueAt: null,
  checklist: [],
  ...options,
})

export const reviewBoardContents = {
  'br-201': {
    members: [niloufar, kamran, leila],
    labels: [
      { id: 'lb-51', name: 'طراحی', tone: 'blue' },
      { id: 'lb-52', name: 'محتوا', tone: 'amber' },
      { id: 'lb-53', name: 'دسترس‌پذیری', tone: 'green' },
      { id: 'lb-54', name: 'بازبینی', tone: 'rose' },
    ],
    lists: [
      list('ls-301', 'در صف', 1000),
      list('ls-302', 'در حال انجام', 2000),
      list('ls-303', 'آمادهٔ بازبینی', 3000),
      list('ls-304', 'انجام‌شده', 4000, true),
    ],
    cards: [
      card('cr-401', 'ls-301', 1000, 'سامان‌دهی ناوبری صفحهٔ اصلی', {
        description: 'مسیرهای اصلی کاربران را از صفحهٔ خانه تا تماس با استودیو بازبینی کنید. ساختار منو باید در موبایل هم خوانا باشد.',
        priority: 'high',
        assigneeId: niloufar.id,
        labelIds: ['lb-51', 'lb-53'],
        dueAt: '2026-11-27T10:30:00.000Z',
        checklist: [
          task('ck-601', 'مرور مسیرهای پرتکرار', 1000, true),
          task('ck-602', 'چیدن نسخهٔ پیشنهادی منو', 2000),
          task('ck-603', 'بازبینی با صفحه‌کلید', 3000),
        ],
      }),
      card('cr-402', 'ls-301', 2000, 'ویرایش متن معرفی خدمات', {
        labelIds: ['lb-52'],
        assigneeId: leila.id,
        checklist: [task('ck-604', 'یکدست کردن نام خدمات', 1000)],
      }),
      card('cr-403', 'ls-301', 3000, 'گردآوری تصویر پروژه‌های منتخب', {
        priority: 'low',
        labelIds: ['lb-52'],
      }),
      card('cr-404', 'ls-302', 1000, 'طراحی نسخهٔ موبایل صفحهٔ خدمات', {
        description: 'فاصله‌گذاری، ترتیب بخش‌ها و رفتار دکمهٔ تماس را در عرض‌های کوچک نمونه‌سازی کنید.',
        priority: 'urgent',
        assigneeId: kamran.id,
        labelIds: ['lb-51'],
        dueAt: '2026-11-18T10:30:00.000Z',
        checklist: [task('ck-605', 'طرح اولیه در عرض ۳۹۰ پیکسل', 1000, true), task('ck-606', 'آزمون چیدمان اولویت محتوا', 2000)],
      }),
      card('cr-405', 'ls-302', 2000, 'همسان‌سازی دکمه‌ها و حالت تمرکز', {
        assigneeId: niloufar.id,
        labelIds: ['lb-51', 'lb-53'],
      }),
      card('cr-406', 'ls-303', 1000, 'بازبینی متن فرم تماس', {
        assigneeId: leila.id,
        labelIds: ['lb-52', 'lb-54'],
        checklist: [task('ck-607', 'بازبینی پیام خطای فرم', 1000, true), task('ck-608', 'تأیید نهایی تیم محتوا', 2000)],
      }),
      card('cr-407', 'ls-304', 1000, 'تهیهٔ فهرست صفحه‌های موجود', {
        completed: true,
        labelIds: ['lb-54'],
        checklist: [task('ck-609', 'جمع‌بندی پیوندهای فعلی', 1000, true)],
      }),
    ],
  },
  'br-202': {
    members: [niloufar, leila],
    labels: [{ id: 'lb-55', name: 'انتشار', tone: 'blue' }],
    lists: [list('ls-305', 'پیشنهادها', 1000), list('ls-306', 'زمان‌بندی انتشار', 2000), list('ls-307', 'منتشرشده', 3000)],
    cards: [
      card('cr-408', 'ls-305', 1000, 'طرح معرفی پروژهٔ باغ ایرانی', { assigneeId: leila.id, labelIds: ['lb-55'] }),
      card('cr-409', 'ls-306', 1000, 'بازبینی تصویر پست معرفی استودیو', {
        assigneeId: niloufar.id,
        checklist: [task('ck-610', 'آماده کردن برش مربعی تصویر', 1000, true), task('ck-611', 'تأیید متن جایگزین تصویر', 2000)],
      }),
      card('cr-410', 'ls-307', 1000, 'انتشار مرور نمونه‌کارهای فصل', { completed: true, labelIds: ['lb-55'] }),
    ],
  },
  'br-204': {
    members: [niloufar, arman],
    labels: [{ id: 'lb-56', name: 'مرکز راهنما', tone: 'green' }, { id: 'lb-57', name: 'پرداخت', tone: 'amber' }],
    lists: [list('ls-308', 'پیش‌نویس راهنما', 1000), list('ls-309', 'بازبینی پشتیبانی', 2000), list('ls-310', 'آمادهٔ انتشار', 3000)],
    cards: [
      card('cr-411', 'ls-308', 1000, 'بازبینی راهنمای پرداخت', {
        description: 'مراحل مشاهدهٔ رسید پرداخت را با آخرین نسخهٔ پنل مشتری هماهنگ کنید.',
        assigneeId: arman.id,
        labelIds: ['lb-56', 'lb-57'],
        dueAt: '2026-11-25T06:00:00.000Z',
        checklist: [task('ck-612', 'تطبیق نام منو با پنل مشتری', 1000, true), task('ck-613', 'مرور نمونهٔ وضعیت پرداخت ناموفق', 2000)],
      }),
      card('cr-412', 'ls-308', 2000, 'افزودن توضیح پیگیری درخواست', { labelIds: ['lb-56'] }),
      card('cr-413', 'ls-309', 1000, 'به‌روزرسانی پرسش‌های پرتکرار تحویل', { assigneeId: arman.id }),
      card('cr-414', 'ls-310', 1000, 'تأیید پیوندهای راهنمای حساب کاربری', { completed: true, labelIds: ['lb-56'] }),
    ],
  },
  'br-205': { members: [niloufar, arman], labels: [], lists: [], cards: [] },
  'br-203': {
    members: [kamran], labels: [],
    lists: [list('ls-311', 'پیش‌نویس داخلی', 1000)],
    cards: [card('cr-415', 'ls-311', 1000, 'مرور مسیر پیشنهادی همکاری', { assigneeId: kamran.id })],
  },
}
