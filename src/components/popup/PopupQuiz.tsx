import { useState } from "react";
import { HiArrowLeft, HiArrowRight, HiCheck } from "react-icons/hi2";
import { POPUP_QUESTIONS, type PopupAnswers } from "../../constants/popup";

export type PopupQuestionId = keyof PopupAnswers;

const TOTAL = POPUP_QUESTIONS.length;

function firstUnansweredStep(answers: Partial<PopupAnswers>) {
  const index = POPUP_QUESTIONS.findIndex((question) => !answers[question.id]);

  return index === -1 ? TOTAL - 1 : index;
}

export function PopupQuiz({
  answers,
  onAnswer,
  onSubmit,
  isSubmitting,
  error,
}: {
  answers: Partial<PopupAnswers>;
  onAnswer: (id: PopupQuestionId, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string;
}) {
  const [step, setStep] = useState(() => firstUnansweredStep(answers));
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const question = POPUP_QUESTIONS[step];
  const selected = answers[question.id];
  const isLast = step === TOTAL - 1;

  const goTo = (nextStep: number) => {
    setDirection(nextStep > step ? "next" : "prev");
    setStep(nextStep);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center">
      <p className="text-[0.75rem] font-semibold tracking-widest text-rose">
        {String(step + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
      </p>

      <div key={step} className={`${direction === "next" ? "pu-slide-next" : "pu-slide-prev"} mt-3 w-full`}>
        <h3 className="whitespace-pre-line text-center text-[clamp(1.2rem,1rem+0.8vw,1.6rem)] font-semibold leading-[1.4] tracking-[-0.02em] text-brown-600">
          {question.title}
        </h3>

        <div
          role="radiogroup"
          aria-label={question.title.replace("\n", " ")}
          className="mt-6 flex flex-col divide-y divide-blush-200"
        >
          {question.options.map((option) => {
            const isSelected = selected === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onAnswer(question.id, option.value)}
                className="pu-press flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="min-w-0">
                  <span
                    className={`block break-keep text-[1rem] leading-5 transition-colors ${
                      isSelected ? "font-semibold text-brown-600" : "font-medium text-brown-400"
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="mt-1 block break-keep text-[0.8rem] leading-4 text-[#9b8179]">
                    {option.hint}
                  </span>
                </span>
                {isSelected ? (
                  <HiCheck key="check" className="pu-pop size-5 shrink-0 text-rose" aria-hidden="true" />
                ) : (
                  <span className="size-5 shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-5">
        <div className="flex items-center gap-2" aria-hidden="true">
          {POPUP_QUESTIONS.map((item, index) => (
            <span
              key={item.id}
              className={`pu-dot size-2 rounded-full ${
                index === step
                  ? "scale-150 bg-brown-600"
                  : index < step
                    ? "bg-brown-300"
                    : "bg-blush-300"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="pu-btn flex h-14 items-center gap-1.5 rounded-full border border-blush-300 bg-white px-5 text-[0.95rem] text-brown-400"
            >
              <HiArrowLeft className="size-4" aria-hidden="true" />
              이전
            </button>
          ) : null}
          <button
            type="button"
            disabled={!selected || isSubmitting}
            onClick={() => (isLast ? onSubmit() : goTo(step + 1))}
            className="pu-btn flex h-14 min-w-52 items-center justify-center gap-2 rounded-full bg-brown-600 px-8 text-[1rem] font-medium text-white shadow-[0_12px_28px_rgb(58_37_39/0.22)] disabled:opacity-40"
          >
            {isLast
              ? isSubmitting
                ? "추천을 찾는 중…"
                : "나의 PICK 보기"
              : "다음 질문"}
            <HiArrowRight className="pu-arrow size-4" aria-hidden="true" />
          </button>
        </div>

        {error ? (
          <p role="alert" className="text-[0.85rem] text-rose">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
