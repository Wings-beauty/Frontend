import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-cream-200 bg-white px-4 py-3 text-base leading-6 text-brown-600 outline-none placeholder:text-[#b9aaa4] focus:border-brown-400",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export { Input };
