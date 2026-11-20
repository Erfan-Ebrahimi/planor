export const boardActivity = {
  'br-201': [
    { id: 'ev-701', type: 'cardCreated', boardId: 'br-201', cardId: 'cr-401', subject: 'سامان‌دهی ناوبری صفحهٔ اصلی', actor: 'نیلوفر رستگار', at: '2026-11-16T06:05:00.000Z' },
    { id: 'ev-702', type: 'attachmentAdded', boardId: 'br-201', cardId: 'cr-401', subject: 'سامان‌دهی ناوبری صفحهٔ اصلی', actor: 'کامران یوسفی', at: '2026-11-16T07:45:00.000Z' },
    { id: 'ev-703', type: 'commentAdded', boardId: 'br-201', cardId: 'cr-401', subject: 'سامان‌دهی ناوبری صفحهٔ اصلی', actor: 'کامران یوسفی', at: '2026-11-17T06:40:00.000Z' },
    { id: 'ev-704', type: 'dueChanged', boardId: 'br-201', cardId: 'cr-404', subject: 'طراحی نسخهٔ موبایل صفحهٔ خدمات', actor: 'نیلوفر رستگار', at: '2026-11-17T08:15:00.000Z' },
    { id: 'ev-705', type: 'commentEdited', boardId: 'br-201', cardId: 'cr-401', subject: 'سامان‌دهی ناوبری صفحهٔ اصلی', actor: 'نیلوفر رستگار', at: '2026-11-17T09:45:00.000Z' },
  ],
  'br-204': [
    { id: 'ev-706', type: 'commentAdded', boardId: 'br-204', cardId: 'cr-411', subject: 'بازبینی راهنمای پرداخت', actor: 'آرمان کریمی', at: '2026-11-19T07:10:00.000Z' },
  ],
  'br-203': [
    { id: 'ev-707', type: 'cardCreated', boardId: 'br-203', cardId: 'cr-415', subject: 'مرور مسیر پیشنهادی همکاری', actor: 'کامران یوسفی', at: '2026-11-19T07:40:00.000Z' },
  ],
}

export const workspaceNotifications = [
  { id: 'nt-901', recipientId: 'usr-1007', kind: 'mention', event: boardActivity['br-201'][2], read: false },
  { id: 'nt-902', recipientId: 'usr-1007', kind: 'activity', event: boardActivity['br-204'][0], read: false },
  { id: 'nt-903', recipientId: 'usr-1007', kind: 'activity', event: boardActivity['br-201'][1], read: true },
  { id: 'nt-904', recipientId: 'usr-1011', kind: 'activity', event: boardActivity['br-201'][3], read: false },
  { id: 'nt-905', recipientId: 'usr-1007', kind: 'activity', event: boardActivity['br-203'][0], read: false },
]
