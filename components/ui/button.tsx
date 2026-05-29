"use client";

import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center hover:cursor-pointer justify-center gap-2 rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70",
          {
            "bg-[#17171c] text-white hover:bg-[#003c33] focus-visible:ring-[#17171c]":
              variant === "default",
            "border border-[#d9d9dd] bg-white text-[#212121] hover:bg-[#f8f8f8] focus-visible:ring-[#d9d9dd]":
              variant === "outline",
            "border border-[#ff7759] text-[#ff7759] hover:bg-[#fff4ef] focus-visible:ring-[#ff7759]":
              variant === "destructive",
            "text-[#212121] hover:bg-[#f8f8f8] focus-visible:ring-[#d9d9dd]":
              variant === "ghost",
          },
          {
            "px-3 py-1 text-xs": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
