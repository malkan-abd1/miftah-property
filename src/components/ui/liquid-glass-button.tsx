"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const liquidbuttonVariants = cva(
  "group relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold outline-none transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[color-mix(in_oklab,white_90%,transparent)] text-foreground shadow-[var(--glass-shadow)] ring-1 ring-inset ring-[var(--glass-ring)] hover:bg-card",
        primary:
          "bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_color-mix(in_oklab,var(--color-primary)_75%,transparent)] hover:brightness-[1.06]",
        destructive:
          "bg-[color-mix(in_oklab,var(--color-destructive)_12%,white)] text-destructive ring-1 ring-inset ring-[color-mix(in_oklab,var(--color-destructive)_28%,transparent)] hover:bg-[color-mix(in_oklab,var(--color-destructive)_18%,white)]",
        ghost: "bg-transparent text-muted-foreground hover:bg-[color-mix(in_oklab,black_5%,transparent)] hover:text-foreground",
      },
      size: {
        sm: "h-9 gap-1.5 px-4 text-xs",
        default: "h-10 px-5 py-2",
        lg: "h-11 px-6",
        xl: "h-12 px-8",
        xxl: "h-14 px-10 text-base",
        icon: "size-10",
        iconSm: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof liquidbuttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp className={cn(liquidbuttonVariants({ variant, size, className }))} {...props}>
      {/* top sheen highlight */}
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px rounded-full bg-[var(--glass-sheen)] opacity-80" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Comp>
  );
}

/** Kept for compatibility: renders nothing heavy so scrolling stays smooth. */
function GlassFilter() {
  return null;
}

export { LiquidButton, liquidbuttonVariants, GlassFilter };
