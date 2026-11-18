export const environment = {
  production: false,
  appName: 'GRAP SOP Management',
  appVersion: '1.0.0',
  apiBaseUrl: 'http://localhost:3000/api',
  storageKeys: {
    SOP_DATA: 'grap_sop_data',
    NOTIFICATIONS: 'grap_notifications',
    USERS: 'grap_users',
    SOP_FILES: 'grap_sop_files',
  },
  fileUpload: {
    maxSizeMB: 10,
    maxSizeBytes: 10 * 1024 * 1024,
    allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt', 'ods', 'odp'],
  },
  pagination: {
    defaultPageSize: 5,
    pageSizeOptions: [5, 10, 25, 50],
    maxVisiblePages: 5,
  },
  sopStatuses: [
    'Draft',
    'Submitted',
    'Requested Modification',
    'Modification In Progress',
    'Resubmitted',
    'Approved',
    'Rejected',
  ],
  userRoles: {
    MAKER: 'Maker',
    REVIEWER: 'Reviewer',
  },
  dateFormats: {
    display: 'dd MMM yyyy',
    dateTime: 'dd MMM yyyy HH:mm',
    input: 'yyyy-MM-dd',
  },
  animation: {
    fast: '0.15s',
    normal: '0.2s',
    slow: '0.3s',
  },
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1200,
  },
  toastDurationMs: 2600,
  debounce: {
    search: 300,
    resize: 150,
  },
};