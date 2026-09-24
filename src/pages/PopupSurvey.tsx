import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowLeft, HiCheck } from "react-icons/hi2";
import {
  ensurePopupSession,
  fetchMyPurchaseSurvey,
  submitPurchaseSurvey,
} from "../api/popup";
import {
  POPUP_PRODUCTS,
  POPUP_PURCHASE_REASONS,
} from "../constants/popup";
import { useWideLayout } from "../hooks/usePopupMotion";
import { Reveal } from "../components/popup/Reveal";
import { formatWon } from "../utils/format";

const COMMENT_MAX_LENGTH = 500;

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function PopupSurvey() {
  useWideLayout();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    ensurePopupSession()
      .then(fetchMyPurchaseSurvey)
      .then((survey) => {
        if (!isMounted || !survey) return;

        setProductKeys(survey.productKeys);
        setReasons(survey.reasons);
        setComment(survey.comment);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : "설문을 준비하지 못했어요.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const canSubmit = productKeys.length > 0 && reasons.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await submitPurchaseSurvey({ productKeys, reasons, comment });
      setIsDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-dvh w-full min-w-0 max-w-[2560px] overflow-x-clip bg-gradient-to-b from-blush-100 via-blush-50 to-white px-5 py-8 text-brown-600 sm:px-8 md:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-center justify-between">
          <Link
            to="/popup"
            className="pu-btn flex items-center gap-1.5 text-[0.85rem] text-brown-400"
          >
            <HiArrowLeft className="size-4" aria-hidden="true" />
            팝업 페이지
          </Link>
          <span className="text-[1.3rem] tracking-[0.06em]">WINGS</span>
        </header>

        {isDone ? (
          <Reveal className="mt-16 flex flex-col items-center gap-5 rounded-[2rem] border border-blush-200 bg-white px-6 py-14 text-center shadow-[0_24px_60px_rgb(107_74_63/0.1)]">
            <span className="pu-pop flex size-16 items-center justify-center rounded-full bg-brown-600 text-white">
              <HiCheck className="size-8" aria-hidden="true" />
            </span>
            <h1 className="text-[1.5rem] font-semibold tracking-[-0.03em]">
              소중한 의견 감사합니다!
            </h1>
            <p className="max-w-xs text-[0.9rem] leading-6 text-[#7a625c]">
              남겨주신 구매 이유는 더 좋은 뷰티 경험을 준비하는 데 사용할게요.
            </p>
            <button
              type="button"
              onClick={() => setIsDone(false)}
              className="pu-btn mt-2 h-12 rounded-full border border-blush-300 bg-white px-6 text-[0.9rem] text-brown-400"
            >
              응답 수정하기
            </button>
          </Reveal>
        ) : (
          <>
            <div className="mt-10 flex flex-col gap-2.5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-brown-200">
                Purchase survey
              </p>
              <h1 className="text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] font-semibold leading-[1.3] tracking-[-0.03em]">
                오늘 구매하신 제품과
                <br />
                구매 이유를 알려주세요
              </h1>
              <p className="text-[0.9rem] leading-6 text-[#7a625c]">
                1분이면 끝나요. 회원가입 없이 바로 참여할 수 있어요.
              </p>
            </div>

            {loadError ? (
              <p role="alert" className="mt-8 rounded-2xl bg-white px-5 py-4 text-[0.9rem] text-rose">
                {loadError}
              </p>
            ) : null}

            <div
              className={`mt-8 flex flex-col gap-8 transition-opacity duration-300 ${
                isLoading ? "opacity-40" : "opacity-100"
              }`}
            >
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 text-[1rem] font-semibold">
                  구매한 제품 <span className="text-[0.8rem] font-normal text-[#9b8179]">(여러 개 선택 가능)</span>
                </legend>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {POPUP_PRODUCTS.map((product) => {
                    const isSelected = productKeys.includes(product.key);

                    return (
                      <button
                        key={product.key}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() => setProductKeys((keys) => toggle(keys, product.key))}
                        className={`pu-press flex items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left transition-colors ${
                          isSelected ? "border-brown-600" : "border-blush-200 hover:border-blush-300"
                        }`}
                      >
                        <span
                          className="size-10 shrink-0 overflow-hidden rounded-full"
                          style={{
                            background: `radial-gradient(circle at 30% 28%, #ffffffaa, ${product.colorHex} 62%)`,
                          }}
                          aria-hidden="true"
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt=""
                              loading="lazy"
                              className="size-full object-cover"
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.72rem] text-brown-300">
                            {product.brand}
                          </span>
                          <span className="block truncate text-[0.88rem] font-semibold">
                            {product.name}
                          </span>
                          <span className="block truncate text-[0.72rem] text-[#9b8179]">
                            {product.shade ? `${product.shade} · ` : ""}
                            {formatWon(product.popupPrice)}
                          </span>
                        </span>
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isSelected
                              ? "border-brown-600 bg-brown-600 text-white"
                              : "border-blush-300 text-transparent"
                          }`}
                          aria-hidden="true"
                        >
                          <HiCheck className="size-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 text-[1rem] font-semibold">
                  구매 이유 <span className="text-[0.8rem] font-normal text-[#9b8179]">(여러 개 선택 가능)</span>
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {POPUP_PURCHASE_REASONS.map((reason) => {
                    const isSelected = reasons.includes(reason);

                    return (
                      <button
                        key={reason}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() => setReasons((list) => toggle(list, reason))}
                        className={`pu-chip pu-press h-11 rounded-full border-2 px-4 text-[0.88rem] transition-colors duration-300 ${
                          isSelected
                            ? "border-brown-600 text-white"
                            : "border-blush-200 bg-white text-brown-400 hover:border-blush-300"
                        }`}
                      >
                        {reason}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="flex flex-col gap-3">
                <label htmlFor="popup-comment" className="text-[1rem] font-semibold">
                  하고 싶은 말 <span className="text-[0.8rem] font-normal text-[#9b8179]">(선택)</span>
                </label>
                <textarea
                  id="popup-comment"
                  value={comment}
                  maxLength={COMMENT_MAX_LENGTH}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  placeholder="구매하면서 느낀 점이나 아쉬운 점을 자유롭게 적어주세요."
                  className="w-full resize-none rounded-2xl border-2 border-blush-200 bg-white p-4 text-[0.92rem] leading-6 outline-none transition-colors placeholder:text-[#b9aaa4] focus:border-brown-600"
                />
                <p className="text-right text-[0.72rem] text-[#b9aaa4]">
                  {comment.length} / {COMMENT_MAX_LENGTH}
                </p>
              </div>

              {submitError ? (
                <p role="alert" className="text-[0.85rem] text-rose">
                  {submitError}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!canSubmit || isLoading}
                onClick={handleSubmit}
                className="pu-btn flex h-14 w-full items-center justify-center rounded-full bg-brown-600 text-[1rem] font-medium text-white shadow-[0_12px_28px_rgb(58_37_39/0.22)] disabled:opacity-40"
              >
                {isSubmitting ? "제출하는 중…" : "설문 제출하기"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
