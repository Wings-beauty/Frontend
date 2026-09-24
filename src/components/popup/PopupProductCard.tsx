import type { KeyboardEvent } from "react";
import type { PopupProduct } from "../../constants/popup";
import { useCountUp } from "../../hooks/usePopupMotion";
import { formatWon } from "../../utils/format";
import { ProductSwatch } from "./ProductSwatch";
import { Reveal } from "./Reveal";
import { WishButton } from "./WishButton";

export function PopupProductCard({
  product,
  reason,
  wished,
  index,
  onOpen,
  onToggleWish,
}: {
  product: PopupProduct;
  reason: string;
  wished: boolean;
  index: number;
  onOpen: () => void;
  onToggleWish: () => void;
}) {
  const price = useCountUp(product.popupPrice);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <Reveal delay={index * 130} variant="scale" className="h-full">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        aria-label={`${product.brand} ${product.name} 자세히 보기`}
        className="pu-press group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-blush-200 bg-white shadow-[0_18px_44px_rgb(107_74_63/0.08)] outline-none transition-shadow hover:shadow-[0_24px_56px_rgb(107_74_63/0.14)] focus-visible:ring-2 focus-visible:ring-brown-400"
      >
        <div className="relative">
          <ProductSwatch
            colorHex={product.colorHex}
            imageUrl={product.imageUrl}
            alt={`${product.brand} ${product.name}`}
            className="aspect-[4/5]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-[#c98a6b] px-2.5 py-1 text-[0.65rem] font-semibold tracking-wider text-white">
            WINGS PICK
          </span>
          <WishButton
            wished={wished}
            onToggle={onToggleWish}
            label={`${product.brand} ${product.name}`}
            className="absolute right-3 top-3"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <p className="text-[0.8rem] font-semibold text-brown-300">{product.brand}</p>
            <h3 className="mt-0.5 text-[1rem] font-semibold leading-snug text-brown-600">
              {product.name}
            </h3>
            {product.shade ? (
              <p className="mt-0.5 text-[0.85rem] text-[#7a625c]">{product.shade}</p>
            ) : null}
          </div>

          <ul className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-blush-100 px-2 py-1 text-[0.72rem] text-[#7a625c]"
              >
                {tag}
              </li>
            ))}
          </ul>

          {/* 카드에는 태그만 보여주고, 추천 이유는 상세 시트에서 보여준다. 스크린리더에는 남겨둔다. */}
          <p className="sr-only">{reason}</p>

          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1">
            <span className="text-[0.8rem] font-semibold text-rose">팝업가</span>
            <span className="text-[1.15rem] font-bold tabular-nums text-rose">
              {formatWon(price)}
            </span>
            <span className="pu-strike text-[0.8rem] tabular-nums text-[#b9aaa4]">
              {formatWon(product.originalPrice)}
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
