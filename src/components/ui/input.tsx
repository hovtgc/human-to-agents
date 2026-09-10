import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-sm border border-line bg-raised px-3 text-ink placeholder:text-ash",
        "transition-[border-color,background-color] duration-150",
        "focus-visible:outline-none focus-visible:border-mist",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
