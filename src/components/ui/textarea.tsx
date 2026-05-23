import * as React from "react";
import { cn } from "../../lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-2xl border border-cream-200 bg-white px-4 py-3 text-base leading-6 text-brown-600 outline-none placeholder:text-[#b9aaa4] focus:border-brown-400",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export { Textarea };
