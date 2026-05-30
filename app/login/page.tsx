import { redirect } from "next/navigation";

import { LoginForm } from "@/features/dashboard/components/login-form";
import { getSessionFromCookieStore } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export default async function LoginPage() {
  const session = await getSessionFromCookieStore();

  if (session) {
    redirect("/dashboard/tasks");
  }

  const userCount = await prisma.user.count();
  const canBootstrap = userCount === 0;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#ffffff] px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_10%_10%,#edfce9_0%,transparent_70%),radial-gradient(55%_40%_at_90%_10%,#f1f5ff_0%,transparent_72%),linear-gradient(180deg,#ffffff_0%,#eeece7_100%)]" />
      <div className="relative z-10 flex w-full items-center justify-center">
        <LoginForm canBootstrap={canBootstrap} />
      </div>
    </main>
  );
}
