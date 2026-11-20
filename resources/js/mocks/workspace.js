export const workspacePage = {
  component: 'Workspace/Overview',
  url: '/',
  version: null,
  props: {
    errors: {},
    homeUrl: '/',
    viewer: {
      id: 'usr-1007',
      name: 'نیلوفر رستگار',
    },
    sidebarShown: true,
  },
}

export const reviewTeams = [
  { id: 'tm-101', name: 'استودیو سپیدار' },
  { id: 'tm-102', name: 'تجربه مشتری پارس‌نگار' },
  { id: 'tm-103', name: 'گروه پژوهش راه‌نو' },
  { id: 'tm-104', name: 'استودیو آفتاب' },
]

export const reviewBoards = [
  { id: 'br-201', teamId: 'tm-101', name: 'بازطراحی وب‌سایت' },
  { id: 'br-202', teamId: 'tm-101', name: 'محتوای شبکه‌های اجتماعی' },
  { id: 'br-203', teamId: 'tm-101', name: 'طرح‌های در دست بررسی' },
  { id: 'br-204', teamId: 'tm-102', name: 'راهنمای مشتریان' },
  { id: 'br-205', teamId: 'tm-102', name: 'بازخورد کاربران' },
  { id: 'br-206', teamId: 'tm-104', name: 'برنامه تولید پاییز' },
]

export const reviewTeamMemberships = [
  { userId: 'usr-1007', teamId: 'tm-101', role: 'manager', canView: true, sidebarCollapsed: false },
  { userId: 'usr-1007', teamId: 'tm-102', role: 'member', canView: true, sidebarCollapsed: true },
  { userId: 'usr-1007', teamId: 'tm-103', role: 'member', canView: true, sidebarCollapsed: false },
  { userId: 'usr-1011', teamId: 'tm-101', role: 'member', canView: true, sidebarCollapsed: false },
  { userId: 'usr-1012', teamId: 'tm-101', role: 'member', canView: true, sidebarCollapsed: false },
  { userId: 'usr-1013', teamId: 'tm-102', role: 'member', canView: true, sidebarCollapsed: false },
]

export const reviewBoardCapabilities = [
  { userId: 'usr-1007', boardId: 'br-201', canView: true, canEdit: true, canComment: true },
  { userId: 'usr-1007', boardId: 'br-202', canView: true, canEdit: true, canComment: true },
  { userId: 'usr-1007', boardId: 'br-203', canView: false },
  { userId: 'usr-1007', boardId: 'br-204', canView: true, canComment: true },
  { userId: 'usr-1007', boardId: 'br-205', canView: true, canEdit: true, canComment: true },
  { userId: 'usr-1011', boardId: 'br-201', canView: true, canComment: true },
  { userId: 'usr-1011', boardId: 'br-203', canView: true, canEdit: true, canComment: true },
  { userId: 'usr-1012', boardId: 'br-201', canView: true, canComment: true },
  { userId: 'usr-1012', boardId: 'br-202', canView: true, canComment: true },
  { userId: 'usr-1013', boardId: 'br-204', canView: true, canEdit: true, canComment: true },
  { userId: 'usr-1013', boardId: 'br-205', canView: true },
]
