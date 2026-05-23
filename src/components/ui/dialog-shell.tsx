import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function DialogShell({
  children,
  onClose,
  className,
}: {
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-[28px] border border-white/60 bg-white shadow-[0_30px_80px_rgb(0_0_0/0.18)]",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
