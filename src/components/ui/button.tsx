import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-brown-600 text-white shadow-[0_8px_20px_rgb(43_33_31/0.14)] hover:bg-brown-400",
  secondary: "bg-cream-100 text-brown-600 hover:bg-cream-200/70",
  outline: "border border-cream-200 bg-white text-brown-600 hover:border-cream-400 hover:bg-cream-50",
  ghost: "bg-transparent text-brown-600 hover:bg-cream-100/70",
  destructive: "bg-red text-white hover:bg-red/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 py-2.5",
  sm: "h-9 rounded-lg px-4 text-sm",
  lg: "h-12 rounded-xl px-6 text-base",
  icon: "size-10 rounded-full p-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-normal leading-6 transition-colors outline-none disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
