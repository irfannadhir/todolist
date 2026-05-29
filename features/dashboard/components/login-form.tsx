"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { loginSchema } from "@/features/users/schemas/user-schema";

const formSchema = loginSchema;
type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitHandler = form.handleSubmit(async (values) => {
    setErrorMessage(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const body = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setErrorMessage(body?.message ?? "Login gagal");
      return;
    }

    router.replace("/dashboard/tasks");
    router.refresh();
  });

  const bootstrapHandler = form.handleSubmit(async (values) => {
    setErrorMessage(null);

    const response = await fetch("/api/auth/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const body = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setErrorMessage(body?.message ?? "Gagal membuat user pertama");
      return;
    }

    router.replace("/dashboard/tasks");
    router.refresh();
  });

  return (
    <section className="mx-auto w-full max-w-md rounded-[22px] border border-[#d9d9dd] bg-white p-6 sm:p-7">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff7759]">Authentication</p>
      <h1 className="mt-2 text-3xl tracking-tight text-[#17171c]">Login Dashboard</h1>
      <p className="mt-2 text-sm text-[#616161]">Masuk menggunakan email dan password user yang sudah terdaftar.</p>

      {errorMessage ? (
        <div className="mt-4 rounded-md border border-[#ffad9b] bg-[#fff4ef] px-3 py-2 text-sm text-[#b30000]">
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={submitHandler} className="mt-5 space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-[#212121]">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border border-[#d9d9dd] px-3 py-2 text-sm outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-[#b30000]">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-[#212121]">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-md border border-[#d9d9dd] px-3 py-2 text-sm outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-[#b30000]">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="inline-flex rounded-full bg-[#17171c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003c33] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {form.formState.isSubmitting ? "Memproses..." : "Login"}
          </button>
          <button
            type="button"
            onClick={() => {
              void bootstrapHandler();
            }}
            disabled={form.formState.isSubmitting}
            className="inline-flex rounded-full border border-[#17171c] px-5 py-2.5 text-sm font-semibold text-[#17171c] transition hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Buat User Pertama
          </button>
        </div>
      </form>
    </section>
  );
}
