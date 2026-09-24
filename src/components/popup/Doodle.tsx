export function Doodle({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none hidden -rotate-3 flex-col items-center gap-0.5 text-rose sm:flex ${className}`}
    >
      <span className="text-[0.95rem] italic leading-none">{text}</span>
      <svg viewBox="0 0 64 36" className="h-8 w-16" fill="none">
        <path
          d="M6 5 C 22 4, 10 22, 28 24 S 44 18, 54 30"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M48 25 L54 30 L46 32"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
