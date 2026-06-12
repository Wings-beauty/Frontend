import * as React from "react";
import { cn } from "../../lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-normal leading-5 text-brown-600",
        className,
      )}
      {...props}
    />
  );
}
