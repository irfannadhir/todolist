import { redirect } from "next/navigation";

import { LoginForm } from "@/features/dashboard/components/login-form";
import { getSessionFromCookieStore } from "@/lib/auth-server";

export default async function LoginPage() {
  const session = await getSessionFromCookieStore();

  if (session) {
    redirect("/dashboard/tasks");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <LoginForm />
    </main>
  );
}
