import { useEffect, useState, type CSSProperties } from "react";
import { HiCheck, HiOutlineCalendarDays, HiOutlineClipboardDocumentCheck, HiOutlineGift, HiOutlineTag } from "react-icons/hi2";
import { POPUP_TIME_SLOTS, type PopupTimeSlot } from "../../constants/popup";
import { fetchMyVisitSlot, saveVisitSlot } from "../../api/popup";
import { Reveal } from "./Reveal";

const CONFETTI = Array.from({ length: 14 }, (_, index) => {
  const angle = (index / 14) * Math.PI * 2 - Math.PI / 2;
  const distance = 70 + (index % 3) * 22;

  return {
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance),
    r: `${(index % 2 === 0 ? 1 : -1) * (160 + index * 20)}deg`,
    color: ["#c4544a", "#f0a58f", "#ecad43", "#6bb594", "#d84f8b"][index % 5],
  };
});

const PERKS = [
  { icon: HiOutlineTag, text: "팝업 한정 제품을 현장에서 바로 확인" },
  { icon: HiOutlineGift, text: "현장 한정 소식과 선착순 기프트" },
  { icon: HiOutlineClipboardDocumentCheck, text: "방문 전 나의 추천 리포트 저장" },
];

type SaveStatus = "idle" | "saving";

export function PopupVisit({ onToast }: { onToast: (message: string) => void }) {
  const [selected, setSelected] = useState<PopupTimeSlot | null>(null);
  const [savedSlot, setSavedSlot] = useState<PopupTimeSlot | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    fetchMyVisitSlot()
      .then((slot) => {
        if (isMounted && slot) {
          setSelected(slot);
          setSavedSlot(slot);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const isSaved = selected !== null && selected === savedSlot;

  const handleSave = async () => {
    if (!selected) return;

    setStatus("saving");

    try {
      await saveVisitSlot(selected);
      setSavedSlot(selected);
      setConfettiKey((key) => key + 1);
      onToast("방문 예정 시간이 저장됐어요");
    } catch (error) {
      onToast(error instanceof Error ? error.message : "저장하지 못했어요.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="grid items-stretch gap-6 md:grid-cols-[1.1fr_0.9fr] md:gap-8">
      <Reveal className="rounded-[2rem] border border-blush-200 bg-white p-6 shadow-[0_18px_44px_rgb(107_74_63/0.08)] sm:p-8">
        <div
          role="radiogroup"
          aria-label="방문 예정 시간"
          className="grid grid-cols-3 gap-3"
        >
          {POPUP_TIME_SLOTS.map((slot) => {
            const isSelected = selected === slot.value;

            return (
              <button
                key={slot.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(slot.value)}
                className={`pu-chip pu-press flex h-14 items-center justify-center rounded-2xl border-2 px-1 text-center text-[0.78rem] leading-tight tabular-nums transition-colors duration-300 sm:text-[0.88rem] ${
                  isSelected
                    ? "border-brown-600 text-white"
                    : "border-blush-200 bg-white text-brown-400 hover:border-blush-300"
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-6">
          <button
            type="button"
            disabled={!selected || status === "saving" || isSaved}
            onClick={handleSave}
            className={`pu-btn flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-[1rem] font-medium text-white shadow-[0_12px_28px_rgb(58_37_39/0.2)] ${
              isSaved ? "disabled:cursor-default" : "disabled:opacity-40"
            }`}
          >
            {isSaved ? (
              <>
                <HiCheck className="pu-pop size-5" aria-hidden="true" />
                방문 예정으로 저장됐어요
              </>
            ) : status === "saving" ? (
              "저장하는 중…"
            ) : (
              "방문 예정으로 저장하기"
            )}
          </button>

          {confettiKey > 0
            ? CONFETTI.map((piece, index) => (
                <i
                  key={`${confettiKey}-${index}`}
                  aria-hidden="true"
                  className="pu-confetti-dot pointer-events-none absolute left-1/2 top-1/2 h-2 w-1.5 rounded-[1px]"
                  style={
                    {
                      backgroundColor: piece.color,
                      "--x": `${piece.x}px`,
                      "--y": `${piece.y}px`,
                      "--r": piece.r,
                    } as CSSProperties
                  }
                />
              ))
            : null}
        </div>

        <p className="mt-4 text-[0.78rem] leading-5 text-[#9b8179]">
          별도 회원가입 없이 이 기기에 저장되며, 시간은 언제든 바꿀 수 있어요.
        </p>
      </Reveal>

      <Reveal
        delay={150}
        className="flex flex-col justify-center gap-5 rounded-[2rem] bg-blush-200/70 p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-white text-rose shadow-sm">
            <HiOutlineCalendarDays className="size-5" aria-hidden="true" />
          </span>
          <p className="text-[1.05rem] font-semibold leading-snug text-brown-600">
            지금, 나에게 맞는
            <br />
            뷰티를 미리 담아두세요.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {PERKS.map((perk) => (
            <li key={perk.text} className="flex items-start gap-3 text-[0.88rem] leading-5 text-brown-400">
              <perk.icon className="mt-0.5 size-5 shrink-0 text-rose" aria-hidden="true" />
              {perk.text}
            </li>
          ))}
        </ul>
        <p className="text-[1.2rem] italic text-rose">See you at WINGS!</p>
      </Reveal>
    </div>
  );
}
