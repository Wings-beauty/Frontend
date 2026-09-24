import { useEffect } from "react";
import { HiCheck, HiXMark } from "react-icons/hi2";
import type { PopupProduct } from "../../constants/popup";
import { formatWon } from "../../utils/format";
import { ProductSwatch } from "./ProductSwatch";
import { WishButton } from "./WishButton";

export function PopupProductSheet({
  product,
  reason,
  wished,
  onToggleWish,
  onClose,
}: {
  product: PopupProduct;
  reason: string;
  wished: boolean;
  onToggleWish: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const discount = Math.round(
    ((product.originalPrice - product.popupPrice) / product.originalPrice) * 100,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.brand} ${product.name}`}
    >
      <div
        className="pu-backdrop absolute inset-0 bg-brown-600/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="pu-sheet relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-[0_-20px_60px_rgb(58_37_39/0.2)] md:rounded-[2rem]">
        <div className="relative">
          <ProductSwatch
            colorHex={product.colorHex}
            imageUrl={product.imageUrl}
            alt={`${product.brand} ${product.name}`}
            className="aspect-[4/5] max-h-[46vh]"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="pu-press absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-brown-600 shadow-sm"
          >
            <HiXMark className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.85rem] font-semibold text-brown-300">{product.brand}</p>
              <h3 className="mt-1 text-[1.3rem] font-semibold leading-snug text-brown-600">
                {product.name}
              </h3>
              {product.shade ? (
                <p className="mt-0.5 text-[0.9rem] text-[#7a625c]">{product.shade}</p>
              ) : null}
            </div>
            <WishButton
              wished={wished}
              onToggle={onToggleWish}
              label={`${product.brand} ${product.name}`}
              className="relative shrink-0 border border-blush-200"
            />
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl bg-blush-50 px-5 py-4">
            <span className="text-[0.85rem] font-semibold text-rose">팝업가</span>
            <span className="text-[1.5rem] font-bold tabular-nums text-rose">
              {formatWon(product.popupPrice)}
            </span>
            <span className="text-[0.9rem] tabular-nums text-[#b9aaa4] line-through">
              {formatWon(product.originalPrice)}
            </span>
            <span className="rounded-full bg-rose px-2 py-0.5 text-[0.72rem] font-semibold text-white">
              {discount}% OFF
            </span>
          </div>

          <div>
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-brown-200">
              Why this pick
            </p>
            <p className="mt-2 flex gap-2 text-[0.95rem] leading-6 text-brown-400">
              <HiCheck className="mt-1 size-4 shrink-0 text-rose" aria-hidden="true" />
              {reason}
            </p>
          </div>

          <ul className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-blush-100 px-3 py-1.5 text-[0.8rem] text-[#7a625c]"
              >
                {tag}
              </li>
            ))}
          </ul>

          <p className="text-[0.78rem] leading-5 text-[#9b8179]">
            팝업가는 행사 당일 현장에서만 적용되며, 온라인 결제는 지원하지 않아요.
          </p>
        </div>
      </div>
    </div>
  );
}
