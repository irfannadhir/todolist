"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { userPayloadSchema } from "@/features/users/schemas/user-schema";
import { type UserPayload, type UserUpdatePayload } from "@/features/users/types/user";

const createSchema = userPayloadSchema;

const updateSchema = z.object({
  email: z.string().trim().email("Format email tidak valid").or(z.literal("")),
  password: z
    .string()
    .max(100, "Password maksimal 100 karakter")
    .refine((value) => value === "" || value.length >= 6, "Password minimal 6 karakter"),
});

type CreateValues = z.infer<typeof createSchema>;
type UpdateValues = z.infer<typeof updateSchema>;

type BaseProps = {
  isSubmitting?: boolean;
  submitLabel: string;
};

type UserFormProps =
  | (BaseProps & {
      mode?: "create";
      defaultValues?: Partial<CreateValues>;
      onSubmit: (payload: UserPayload) => Promise<void>;
    })
  | (BaseProps & {
      mode: "edit";
      defaultValues?: Partial<UpdateValues>;
      onSubmit: (payload: UserUpdatePayload) => Promise<void>;
    });

export function UserForm({
  mode = "create",
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: UserFormProps) {
  const isEditMode = mode === "edit";

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: (defaultValues?.email as string | undefined) ?? "",
      password: (defaultValues?.password as string | undefined) ?? "",
    },
  });

  const updateForm = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      email: (defaultValues?.email as string | undefined) ?? "",
      password: (defaultValues?.password as string | undefined) ?? "",
    },
  });

  if (!isEditMode) {
    const submitHandler = createForm.handleSubmit(async (values) => {
      const payload = createSchema.parse(values);
      await (onSubmit as (payload: UserPayload) => Promise<void>)(payload);
      createForm.reset({ email: "", password: "" });
    });

    return (
      <form onSubmit={submitHandler} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="create-email" className="text-sm font-medium text-[#212121]">
            Email
          </label>
          <input
            id="create-email"
            type="email"
            className="w-full rounded-md border border-[#d9d9dd] px-3 py-2 text-sm outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
            {...createForm.register("email")}
          />
          {createForm.formState.errors.email ? (
            <p className="text-xs text-[#b30000]">{createForm.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="create-password" className="text-sm font-medium text-[#212121]">
            Password
          </label>
          <input
            id="create-password"
            type="password"
            className="w-full rounded-md border border-[#d9d9dd] px-3 py-2 text-sm outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
            {...createForm.register("password")}
          />
          {createForm.formState.errors.password ? (
            <p className="text-xs text-[#b30000]">{createForm.formState.errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex rounded-full bg-[#17171c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003c33] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </button>
      </form>
    );
  }

  const submitHandler = updateForm.handleSubmit(async (values) => {
    const parsed = updateSchema.parse(values);
    const payload: UserUpdatePayload = {
      ...(parsed.email ? { email: parsed.email } : {}),
      ...(parsed.password ? { password: parsed.password } : {}),
    };

    await (onSubmit as (payload: UserUpdatePayload) => Promise<void>)(payload);
  });

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="update-email" className="text-sm font-medium text-[#212121]">
          Email Baru (opsional)
        </label>
        <input
          id="update-email"
          type="email"
          className="w-full rounded-md border border-[#d9d9dd] px-3 py-2 text-sm outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
          {...updateForm.register("email")}
        />
        {updateForm.formState.errors.email ? (
          <p className="text-xs text-[#b30000]">{updateForm.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="update-password" className="text-sm font-medium text-[#212121]">
          Password Baru (opsional)
        </label>
        <input
          id="update-password"
          type="password"
          className="w-full rounded-md border border-[#d9d9dd] px-3 py-2 text-sm outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
          {...updateForm.register("password")}
        />
        {updateForm.formState.errors.password ? (
          <p className="text-xs text-[#b30000]">{updateForm.formState.errors.password.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex rounded-full bg-[#17171c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003c33] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
