"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      await queryClient.cancelQueries();
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDialog
      title="Logout"
      description="Apakah Anda yakin ingin keluar dari akun ini?"
      confirmText="Ya, Logout"
      cancelText="Batal"
      onConfirm={handleLogout}
      trigger={
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? "Memproses..." : "Logout"}
        </Button>
      }
    />
  );
}
