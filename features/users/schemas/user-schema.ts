import { z } from "zod";

export const userPayloadSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter"),
});

export const userUpdatePayloadSchema = userPayloadSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, "Minimal satu field harus diupdate");

export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});
