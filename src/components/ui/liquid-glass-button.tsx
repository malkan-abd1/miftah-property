"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-[1.03] active:scale-[0.98] duration-300 transition text-foreground",
        primary: "bg-transparent hover:scale-[1.03] active:scale-[0.98] duration-300 transition text-primary-foreground",
        destructive: "bg-transparent hover:scale-[1.03] active:scale-[0.98] duration-300 transition text-destructive",
      },
      size: {
        sm: "h-9 text-xs gap-1.5 px-4",
        default: "h-10 px-5 py-2",
        lg: "h-11 px-6",
        xl: "h-12 px-8",
        xxl: "h-14 px-10 text-base",
        icon: "size-10",
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
    <Comp
      className={cn("relative isolate", liquidbuttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* refraction layer */}
      <span
        className="pointer-events-none absolute inset-0 -z-10 rounded-full"
        style={{ backdropFilter: "url(#meftah-glass) blur(2px)" }}
      />
      {/* tint + inner light */}
      <span
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[var(--glass-tint)] shadow-[var(--glass-shadow)]"
      />
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full ring-1 ring-inset ring-[var(--glass-ring)]" />
      <span className="pointer-events-none absolute inset-x-3 top-0 -z-10 h-px rounded-full bg-[var(--glass-sheen)]" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Comp>
  );
}

/** SVG displacement filter that gives the buttons real liquid-glass refraction. */
function GlassFilter() {
  return (
    <svg aria-hidden className="pointer-events-none absolute size-0">
      <defs>
        <filter id="meftah-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

export { LiquidButton, liquidbuttonVariants, GlassFilter };
