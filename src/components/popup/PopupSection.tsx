import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function PopupSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  align = "center",
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "center" | "left";
}) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <section
      id={id}
      className={`scroll-mt-16 px-5 py-14 sm:px-8 md:py-20 3xl:py-28 ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className={`mb-8 flex flex-col gap-2.5 md:mb-12 ${alignment}`}>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-brown-200">
            {eyebrow}
          </p>
          <h2 className="whitespace-pre-line text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] font-semibold leading-[1.3] tracking-[-0.03em] text-brown-600">
            {title}
          </h2>
          {description ? (
            <p className="max-w-xl text-[0.9rem] leading-6 text-[#7a625c]">{description}</p>
          ) : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
