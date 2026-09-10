import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,border-color,color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-paper text-paper-ink hover:opacity-90 active:not-disabled:scale-[0.96]",
        clone:
          "bg-sage text-canvas hover:opacity-90 active:not-disabled:scale-[0.96]",
        outline:
          "border border-line bg-transparent text-ink hover:bg-raised active:not-disabled:scale-[0.96]",
        ghost: "text-mist hover:text-ink hover:bg-raised active:not-disabled:scale-[0.96]",
        subtle: "bg-raised text-ink hover:bg-panel active:not-disabled:scale-[0.96]",
      },
      size: {
        sm: "h-10 rounded-sm px-3 text-sm sm:h-9",
        md: "h-11 rounded-sm px-4 text-sm",
        icon: "size-11 rounded-sm",
        "icon-sm": "size-10 rounded-sm sm:size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
