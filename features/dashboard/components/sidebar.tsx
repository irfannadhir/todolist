"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/features/dashboard/components/logout-button";

type SidebarProps = {
  email: string;
};

const navItems = [
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Users", href: "/dashboard/users" },
];

export function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-[#d9d9dd] bg-[#17171c] p-5 text-white lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex items-start justify-between gap-3 lg:block">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ffad9b]">Dashboard</p>
          <h1 className="mt-2 text-2xl tracking-tight">Daily Tracker</h1>
          <p className="mt-2 text-sm text-[#d9d9dd]">{email}</p>
        </div>
        <div className="lg:mt-5">
          <LogoutButton />
        </div>
      </div>

      <nav className="mt-6 grid gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-md px-4 py-2.5 text-sm font-medium transition",
                isActive ? "bg-white text-[#17171c]" : "text-[#edfce9] hover:bg-[#003c33]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
