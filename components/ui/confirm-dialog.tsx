"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  trigger: React.ReactNode;
  isLoading?: boolean;
  confirmVariant?: "default" | "outline" | "ghost" | "destructive";
  triggerDisabled?: boolean;
}

export function ConfirmDialog({
  title = "Konfirmasi",
  description = "Apakah Anda yakin ingin melanjutkan?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  trigger,
  isLoading = false,
  confirmVariant = "destructive",
  triggerDisabled = false,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const isBusy = isLoading || isConfirming;

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await onConfirm();
      setOpen(false);
    } catch {
      // Keep dialog open when action fails (for example form validation error).
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={triggerDisabled}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isBusy}>
              {cancelText}
            </Button>
          </DialogTrigger>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isBusy}
          >
            {isBusy ? "Memproses..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
