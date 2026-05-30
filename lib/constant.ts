import { z } from "zod";

const nonEmptyEnvString = (name: string) =>
  z
    .string({
      error: () => `Environment variable ${name} wajib diisi.`,
    })
    .transform((value) => value.trim())
    .refine(
      (value) =>
        value.length > 0 &&
        value.toLowerCase() !== "null" &&
        value.toLowerCase() !== "undefined",
      {
        message: `Environment variable ${name} tidak boleh kosong/null.`,
      },
    );

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: nonEmptyEnvString("DATABASE_URL"),
  JWT_SECRET: nonEmptyEnvString("JWT_SECRET"),
  CRON_SECRET: nonEmptyEnvString("CRON_SECRET"),
  TASK_REMINDER_TIMEZONE: nonEmptyEnvString("TASK_REMINDER_TIMEZONE"),
  TASK_REMINDER_DRY_RUN: z
    .enum(["true", "false"], {
      error: () => "Environment variable TASK_REMINDER_DRY_RUN harus true/false.",
    })
    .optional()
    .default("false")
    .transform((value) => value === "true"),
  RESEND_API_KEY: nonEmptyEnvString("RESEND_API_KEY"),
  RESEND_FROM_EMAIL: nonEmptyEnvString("RESEND_FROM_EMAIL"),
});

const envResult = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,
  TASK_REMINDER_TIMEZONE: process.env.TASK_REMINDER_TIMEZONE,
  TASK_REMINDER_DRY_RUN: process.env.TASK_REMINDER_DRY_RUN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
});

if (!envResult.success) {
  const issues = envResult.error.issues.map((issue) => `- ${issue.message}`).join("\n");
  throw new Error(`Konfigurasi environment tidak valid:\n${issues}`);
}

const env = envResult.data;

export const NODE_ENV = env.NODE_ENV;
export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_DEVELOPMENT = NODE_ENV === "development";
export const DATABASE_URL = env.DATABASE_URL;
export const JWT_SECRET = env.JWT_SECRET;
export const CRON_SECRET = env.CRON_SECRET;
export const TASK_REMINDER_TIMEZONE = env.TASK_REMINDER_TIMEZONE;
export const TASK_REMINDER_DRY_RUN = env.TASK_REMINDER_DRY_RUN;
export const RESEND_API_KEY = env.RESEND_API_KEY;
export const RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL;
