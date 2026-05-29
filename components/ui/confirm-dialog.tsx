"use client";

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
}

export function ConfirmDialog({
  title = "Konfirmasi",
  description = "Apakah Anda yakin ingin melanjutkan?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  trigger,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              {cancelText}
            </Button>
          </DialogTrigger>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
