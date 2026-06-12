import * as React from "react";
import { cn } from "../../lib/utils";

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-center overflow-hidden rounded-full border border-cream-200 bg-white", className)} {...props} />;
}

export function AvatarImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img className="size-full object-cover" {...props} />;
}

export function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex size-full items-center justify-center text-brown-400", className)} {...props} />;
}
