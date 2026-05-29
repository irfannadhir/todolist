"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-full border border-[#ffad9b] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#ffad9b] transition hover:bg-[#2b2b35] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Keluar..." : "Logout"}
    </button>
  );
}
