"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { Toaster, toast } from "sonner";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
};

type ToastContextValue = {
  showToast: (toast: ToastInput & { variant?: ToastVariant }) => void;
  success: (toast: ToastInput) => void;
  error: (toast: ToastInput) => void;
  info: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showToast = useCallback(
    ({ title, description, variant = "info" }: ToastInput & { variant?: ToastVariant }) => {
      if (variant === "success") {
        toast.success(title, { description });
        return;
      }

      if (variant === "error") {
        toast.error(title, { description });
        return;
      }

      toast.info(title, { description });
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (toast) => showToast({ ...toast, variant: "success" }),
      error: (toast) => showToast({ ...toast, variant: "error" }),
      info: (toast) => showToast({ ...toast, variant: "info" }),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast harus dipakai di dalam ToastProvider");
  }

  return context;
}
