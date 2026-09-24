import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "../../hooks/usePopupMotion";

export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "scale";
}) {
  const ref = useReveal<HTMLDivElement>();
  const motionClass = variant === "scale" ? "pu-reveal-scale" : "pu-reveal";

  return (
    <div
      ref={ref}
      className={`${motionClass} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
