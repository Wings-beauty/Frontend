"use client";

import { createContext, useContext, useEffect, useMemo, useState, type HTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import { cn } from "../../lib/utils";
import { Button } from "./button";

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog components must be used within Dialog.");
  }

  return context;
}

export function Dialog({ open, onOpenChange, children }: DialogContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ open, onOpenChange }), [open, onOpenChange]);

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
}: HTMLAttributes<HTMLDivElement> & {
  showCloseButton?: boolean;
}) {
  const { open, onOpenChange } = useDialogContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  if (!isMounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        aria-label="대화상자 닫기"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-3xl border border-white/60 bg-white shadow-[0_30px_80px_rgb(0_0_0/0.18)]",
          className,
        )}
      >
        {showCloseButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-20 bg-white/80 backdrop-blur"
            aria-label="닫기"
            onClick={() => onOpenChange(false)}
          >
            <HiXMark className="size-5" aria-hidden="true" />
          </Button>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-2xl leading-9 text-brown-600", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-[#7a625c]", className)} {...props} />;
}
