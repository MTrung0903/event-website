export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot',
  RESET_PASSWORD: '/reset-password',
  SEARCH: '/search',
  EVENT_DETAIL: '/event/:eventId',
  ALL_EVENTS: '/all-event',
  SEARCH_BY_TYPE: '/list-event-search-by/:categoryName',
  CHECKOUT: '/checkout',
  EVENT_LIKE: '/event-like',
  CREATE_EVENT: '/createEvent',
  NOTIFICATIONS: '/notifications',
  MY_INVOICES: '/myinvoices',
  VIEW_ALL_TICKETS: '/view-all-tickets',
  VIEW_TICKET: '/view-tickets/:orderCode',
  PAYMENT_RESULT: '/payment-result',
  PROFILE_ORGANIZER: '/profile-organizer/:organizerName',
  DASHBOARD: '/dashboard',
  DASHBOARD_EVENTS: '/dashboard/events',
  DASHBOARD_REPORTS: '/dashboard/reports',
  CHAT: '/chat',
  CALENDAR: '/calendar',
  ROLE: '/role',
  ASSIGNED_EVENTS: '/assigned-events',
  VIEW_PROFILE: '/view',
  ADMIN: '/admin',
  ADMIN_USER: '/admin/user',
  ADMIN_ROLE: '/admin/role',
  EVENT_DETAIL_VIEW: '/dashboard/view/:eventId',
  EVENT_DETAIL_SESSION: '/dashboard/session/:eventId',
  EVENT_DETAIL_SPEAKER: '/dashboard/speaker/:eventId',
  EVENT_DETAIL_SPONSOR: '/dashboard/sponsor/:eventId',
  EVENT_DETAIL_ADDTICKET: '/dashboard/addticket/:eventId',
  EVENT_DETAIL_EDIT: '/dashboard/editEvent/:eventId',
  EVENT_DETAIL_TICKET: '/dashboard/ticket/:eventId',
  EVENT_DETAIL_MY_TEAM: '/dashboard/my-team/:eventId',
  EVENT_DETAIL_DETAIL: '/dashboard/event/detail/:eventId',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  ATTENDEE: 'ATTENDEE',
  TICKET_MANAGER: 'TICKET MANAGER',
  EVENT_ASSISTANT: 'EVENT ASSISTANT',
  CHECK_IN_STAFF: 'CHECK-IN STAFF',
};

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

export const FULLSCREEN_ROUTES = [
  ROUTES.HOME,
  ROUTES.SEARCH,
  ROUTES.CHECKOUT,
  ROUTES.EVENT_LIKE,
  ROUTES.CREATE_EVENT,
  ROUTES.ALL_EVENTS,
  ROUTES.PAYMENT_RESULT,
  ROUTES.MY_INVOICES,
  ROUTES.VIEW_ALL_TICKETS,
  ROUTES.NOTIFICATIONS,
];

export const DASHBOARD_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.DASHBOARD_EVENTS,
  ROUTES.DASHBOARD_REPORTS,
  ROUTES.CHAT,
  ROUTES.CALENDAR,
  ROUTES.NOTIFICATIONS,
  ROUTES.VIEW_PROFILE,
  ROUTES.ROLE,
  ROUTES.ASSIGNED_EVENTS,
];

export const EVENT_DETAIL_ROUTES = [
  ROUTES.EVENT_DETAIL_VIEW,
  ROUTES.EVENT_DETAIL_SESSION,
  ROUTES.EVENT_DETAIL_SPEAKER,
  ROUTES.EVENT_DETAIL_SPONSOR,
  ROUTES.EVENT_DETAIL_ADDTICKET,
  ROUTES.EVENT_DETAIL_EDIT,
  ROUTES.EVENT_DETAIL_TICKET,
  ROUTES.EVENT_DETAIL_MY_TEAM,
  ROUTES.EVENT_DETAIL_DETAIL,
];

export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_USER,
  ROUTES.ADMIN_ROLE,
];