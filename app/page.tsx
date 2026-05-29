import { redirect } from "next/navigation";

import { getSessionFromCookieStore } from "@/lib/auth-server";

export default async function HomePage() {
  const session = await getSessionFromCookieStore();

  if (session) {
    redirect("/dashboard/tasks");
  }

  redirect("/login");
}
