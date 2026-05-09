// Booking related constants
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const BOOKING_TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
] as const;

export const BOOKING_SERVICE_FEE = 50;
export const BOOKING_MIN_ADVANCE_DAYS = 1;

// Pricing constants
export const PRICE_CONSTRAINTS = {
  MIN: 100,
  MAX: 10000,
} as const;

// Validation constraints
export const VALIDATION = {
  PHONE_LENGTH: 10,
  NAME_MIN: 2,
  NAME_MAX: 100,
  ADDRESS_MIN: 5,
  ADDRESS_MAX: 200,
  PASSWORD_MIN: 8,
  PASSWORD_MIN_SIMPLE: 6,
  EXPERIENCE_MAX: 500,
  BIO_MAX: 1000,
  REVIEW_MIN: 5,
  REVIEW_MAX: 1000,
  DESCRIPTION_MAX: 500,
} as const;

// Rating constraints
export const RATING = {
  MIN: 1,
  MAX: 5,
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user",
} as const;

// Status color mapping for UI
export const STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: "bg-yellow-500/20 text-yellow-400",
  [BOOKING_STATUS.CONFIRMED]: "bg-blue-500/20 text-blue-400",
  [BOOKING_STATUS.IN_PROGRESS]: "bg-primary/20 text-primary",
  [BOOKING_STATUS.COMPLETED]: "bg-green-500/20 text-green-400",
  [BOOKING_STATUS.CANCELLED]: "bg-destructive/20 text-destructive",
} as const;

// Status labels for display
export const STATUS_LABELS: Record<string, string> = {
  [BOOKING_STATUS.PENDING]: "Pending",
  [BOOKING_STATUS.CONFIRMED]: "Confirmed",
  [BOOKING_STATUS.IN_PROGRESS]: "In Progress",
  [BOOKING_STATUS.COMPLETED]: "Completed",
  [BOOKING_STATUS.CANCELLED]: "Cancelled",
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Invalid email address",
  PASSWORD_MISMATCH: "Passwords don't match",
  WEAK_PASSWORD: "Password is too weak",
  INVALID_PHONE: "Invalid phone number",
  INVALID_ADDRESS: "Invalid address",
  DATE_IN_PAST: "Date must be in the future",
  NETWORK_ERROR: "Network error. Please try again.",
  SERVER_ERROR: "Server error. Please try again later.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: "Booking confirmed! Check your dashboard for details.",
  PROFILE_UPDATED: "Profile updated successfully.",
  ACCOUNT_CREATED: "Account created! Check your email for verification.",
} as const;
