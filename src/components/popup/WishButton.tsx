import { useState, type CSSProperties } from "react";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";

const BURST_DOTS = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2;

  return {
    x: Math.round(Math.cos(angle) * 30),
    y: Math.round(Math.sin(angle) * 30),
    color: index % 2 === 0 ? "#c4544a" : "#f0a58f",
  };
});

export function WishButton({
  wished,
  onToggle,
  label,
  className,
}: {
  wished: boolean;
  onToggle: () => void;
  label: string;
  /** 버튼 위치 클래스(absolute 또는 relative)를 반드시 포함해야 파티클이 버튼 기준으로 뜬다. */
  className: string;
}) {
  const [burstKey, setBurstKey] = useState(0);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!wished) {
      setBurstKey((key) => key + 1);
    }

    onToggle();
  };

  return (
    <button
      type="button"
      aria-pressed={wished}
      aria-label={wished ? `${label} 찜 해제` : `${label} 찜하기`}
      onClick={handleClick}
      className={`pu-press flex size-10 items-center justify-center rounded-full bg-white/90 text-brown-400 shadow-sm ${className}`}
    >
      {burstKey > 0 && wished
        ? BURST_DOTS.map((dot, index) => (
            <i
              key={`${burstKey}-${index}`}
              aria-hidden="true"
              className="pu-burst-dot pointer-events-none absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] size-1.5 rounded-full"
              style={
                {
                  backgroundColor: dot.color,
                  "--x": `${dot.x}px`,
                  "--y": `${dot.y}px`,
                } as CSSProperties
              }
            />
          ))
        : null}
      {wished ? (
        <HiHeart
          key={burstKey}
          className="pu-heart-pop size-5 text-rose"
          aria-hidden="true"
        />
      ) : (
        <HiOutlineHeart className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
