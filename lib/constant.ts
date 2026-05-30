export const AUTH_TOKEN_STORAGE_KEY = "todolist_access_token";

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_DEVELOPMENT = NODE_ENV === "development";

export const DATABASE_URL = process.env.DATABASE_URL;

export const JWT_SECRET = process.env.JWT_SECRET;

export const CRON_SECRET = process.env.CRON_SECRET;
export const TASK_REMINDER_TIMEZONE =
  process.env.TASK_REMINDER_TIMEZONE ?? "Asia/Jakarta";
export const TASK_REMINDER_DRY_RUN =
  process.env.TASK_REMINDER_DRY_RUN === "true";

export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
