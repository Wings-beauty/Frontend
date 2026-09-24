import { useMemo, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import {
  POPUP_PRODUCTS,
  POPUP_QUESTIONS,
  type PopupCategory,
} from "../../constants/popup";
import { PopupProductCard } from "./PopupProductCard";

type FilterValue = "all" | PopupCategory;

const CATEGORY_OPTIONS = POPUP_QUESTIONS[0].options;
const PAGE_SIZE = 9;

export function PopupAllProducts({
  wished,
  onOpen,
  onToggleWish,
}: {
  wished: Set<string>;
  onOpen: (productKey: string) => void;
  onToggleWish: (productKey: string) => void;
}) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [page, setPage] = useState(1);

  const countOf = (value: FilterValue) =>
    value === "all"
      ? POPUP_PRODUCTS.length
      : POPUP_PRODUCTS.filter((product) => product.category === value).length;

  const filtered = useMemo(
    () =>
      filter === "all"
        ? POPUP_PRODUCTS
        : POPUP_PRODUCTS.filter((product) => product.category === filter),
    [filter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const changeFilter = (value: FilterValue) => {
    setFilter(value);
    setPage(1);
  };

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="제품 카테고리"
        className="pu-no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:justify-center md:px-0"
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          onClick={() => changeFilter("all")}
          className={`pu-press shrink-0 rounded-full border-2 px-4 py-2 text-[0.85rem] transition-colors ${
            filter === "all"
              ? "border-brown-600 bg-brown-600 text-white"
              : "border-blush-200 bg-white text-brown-400 hover:border-blush-300"
          }`}
        >
          전체 <span className="tabular-nums opacity-70">{countOf("all")}</span>
        </button>
        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={filter === option.value}
            onClick={() => changeFilter(option.value)}
            className={`pu-press shrink-0 rounded-full border-2 px-4 py-2 text-[0.85rem] transition-colors ${
              filter === option.value
                ? "border-brown-600 bg-brown-600 text-white"
                : "border-blush-200 bg-white text-brown-400 hover:border-blush-300"
            }`}
          >
            {option.label}{" "}
            <span className="tabular-nums opacity-70">{countOf(option.value)}</span>
          </button>
        ))}
      </div>

      {pageItems.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {pageItems.map((product, index) => (
            <PopupProductCard
              key={product.key}
              product={product}
              reason={product.reason}
              index={index}
              wished={wished.has(product.key)}
              onOpen={() => onOpen(product.key)}
              onToggleWish={() => onToggleWish(product.key)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-[0.9rem] text-[#9b8179]">
          해당 카테고리 제품이 아직 없어요.
        </p>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label="제품 목록 페이지"
          className="mt-8 flex items-center justify-center gap-2"
        >
          <button
            type="button"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
            aria-label="이전 페이지"
            className="pu-press flex size-9 items-center justify-center rounded-full border border-blush-200 text-brown-400 disabled:opacity-30"
          >
            <HiChevronLeft className="size-4" aria-hidden="true" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              aria-current={page === pageNumber ? "page" : undefined}
              onClick={() => goToPage(pageNumber)}
              className={`pu-press flex size-9 items-center justify-center rounded-full text-[0.85rem] tabular-nums transition-colors ${
                page === pageNumber
                  ? "bg-brown-600 text-white"
                  : "text-brown-400 hover:bg-blush-100"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
            aria-label="다음 페이지"
            className="pu-press flex size-9 items-center justify-center rounded-full border border-blush-200 text-brown-400 disabled:opacity-30"
          >
            <HiChevronRight className="size-4" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
