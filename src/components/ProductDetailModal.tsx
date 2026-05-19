import {
  HiArrowTopRightOnSquare,
  HiHeart,
  HiShoppingBag,
  HiXMark,
} from "react-icons/hi2";
import type { RecommendedProduct } from "../api/products";
import { getProductCategoryLabel } from "../constants/products";

function formatPrice(price: number | null) {
  if (typeof price !== "number") {
    return "";
  }

  return `${price.toLocaleString("ko-KR")}원`;
}

export default function ProductDetailModal({
  product,
  isLiked,
  onClose,
  onToggleLike,
}: {
  product: RecommendedProduct;
  isLiked?: boolean;
  onClose: () => void;
  onToggleLike?: (productId: number) => void;
}) {
  const detailItems = [
    { label: "카테고리", value: getProductCategoryLabel(product.category) },
    { label: "컬러", value: product.productColor },
    { label: "추천 톤", value: product.toneType },
    { label: "세부 톤", value: product.detailedTone },
    { label: "립 타입", value: product.lipType },
    { label: "텍스처", value: product.texture },
    { label: "추천 피부 타입", value: product.recommendedSkinType },
  ].filter((item) => item.value);

  const openProductPage = () => {
    if (!product.productUrl) {
      return;
    }

    window.location.href = product.productUrl;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-4 pb-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={onClose}
    >
      <section
        className="max-h-[88dvh] w-full max-w-120 overflow-y-auto rounded-3xl bg-white shadow-[0_24px_70px_rgb(0_0_0/0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-normal leading-5 text-brown-300">
            <HiShoppingBag className="size-5" aria-hidden="true" />
            제품 정보
          </div>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-cream-50 text-brown-600"
            aria-label="제품 정보 닫기"
            onClick={onClose}
          >
            <HiXMark className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pb-6">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-cream-50">
            {product.productImageUrl ? (
              <img
                src={product.productImageUrl}
                className="size-full object-cover"
                alt={product.productName}
              />
            ) : (
              <div
                className="size-full"
                style={{ backgroundColor: product.colorHex ?? "#fff9e6" }}
              />
            )}
            {onToggleLike ? (
              <button
                type="button"
                className={`absolute right-3 top-3 flex size-11 items-center justify-center rounded-full shadow-sm ${
                  isLiked
                    ? "bg-[#df7e8b] text-white"
                    : "bg-white/90 text-brown-600"
                }`}
                aria-label={`${product.productName} 찜하기`}
                onClick={() => onToggleLike(product.id)}
              >
                <HiHeart
                  className={`size-6 ${isLiked ? "fill-current" : ""}`}
                  aria-hidden="true"
                />
              </button>
            ) : null}
          </div>

          <div className="pt-6">
            <p className="text-base font-normal leading-6 text-[#7a625c]">
              {product.brandName}
            </p>
            <h2
              id="product-detail-title"
              className="mt-2 text-2xl font-normal leading-9 text-brown-600"
            >
              {product.productName}
            </h2>
            {product.price ? (
              <p className="mt-3 text-lg font-normal leading-7 text-brown-600">
                {formatPrice(product.price)}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-cream-50 px-4 py-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ivory bg-white"
              style={{ backgroundColor: product.colorHex ?? "#fff9e6" }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-normal leading-5 text-brown-300">
                대표 컬러
              </p>
              <p className="mt-1 text-base font-normal leading-6 text-brown-600">
                {product.productColor || product.colorHex || "컬러 정보 없음"}
              </p>
            </div>
          </div>

          {detailItems.length > 0 ? (
            <dl className="mt-5 grid grid-cols-2 gap-3">
              {detailItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-cream-200 bg-white px-4 py-3"
                >
                  <dt className="text-xs font-normal leading-5 text-brown-300">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-normal leading-6 text-brown-600">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <button
            type="button"
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brown-600 text-base font-normal leading-6 text-white shadow-lg disabled:bg-brown-200"
            onClick={openProductPage}
            disabled={!product.productUrl}
          >
            구매하러 가기
            <HiArrowTopRightOnSquare className="size-5" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
