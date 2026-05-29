import { redirect } from "next/navigation";

import { Sidebar } from "@/features/dashboard/components/sidebar";
import { LogoutButton } from "@/features/dashboard/components/logout-button";
import { getSessionFromCookieStore } from "@/lib/auth-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookieStore();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#edfce9_0%,_transparent_45%),radial-gradient(circle_at_bottom_left,_#f1f5ff_0%,_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#fbfbfb_100%)] lg:flex">
      <Sidebar email={session.email} />
      <main className="w-full">
        <div className="flex items-center justify-end bg-[#17171c] px-4 py-3 sm:px-6 lg:px-8">
          <LogoutButton />
        </div>
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
