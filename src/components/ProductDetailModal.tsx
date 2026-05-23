import {
  HiArrowTopRightOnSquare,
  HiHeart,
  HiShoppingBag,
  HiXMark,
} from "react-icons/hi2";
import type { RecommendedProduct } from "../api/products";
import { getProductCategoryLabel } from "../constants/products";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { DialogShell } from "./ui/dialog-shell";

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

  return (
    <DialogShell onClose={onClose} className="max-w-lg overflow-hidden">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cream-100 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2 text-sm text-brown-300">
          <HiShoppingBag className="size-5" aria-hidden="true" />
          상품 정보
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="상품 정보 닫기"
          onClick={onClose}
        >
          <HiXMark className="size-5" aria-hidden="true" />
        </Button>
      </div>

      <div className="max-h-[85dvh] overflow-y-auto px-5 py-5">
        <div className="relative aspect-square overflow-hidden rounded-[28px] bg-cream-50">
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
            <Button
              type="button"
              variant={isLiked ? "default" : "secondary"}
              size="icon"
              className="absolute right-3 top-3 shadow-sm"
              aria-label={`${product.productName} 찜하기`}
              onClick={() => onToggleLike(product.id)}
            >
              <HiHeart
                className={`size-5 ${isLiked ? "fill-current" : ""}`}
                aria-hidden="true"
              />
            </Button>
          ) : null}
        </div>

        <div className="pt-6">
          <Badge className="mb-3 bg-cream-50 text-brown-300">추천 상품</Badge>
          <p className="text-base leading-6 text-[#7a625c]">{product.brandName}</p>
          <h2 className="mt-2 text-2xl leading-9 text-brown-600">
            {product.productName}
          </h2>
          {product.price ? (
            <p className="mt-3 text-lg leading-7 text-brown-600">
              {formatPrice(product.price)}
            </p>
          ) : null}
        </div>

        <Card className="mt-5 border-none bg-cream-50 shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ivory bg-white"
              style={{ backgroundColor: product.colorHex ?? "#fff9e6" }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm leading-5 text-brown-300">대표 컬러</p>
              <p className="mt-1 text-base leading-6 text-brown-600">
                {product.productColor || product.colorHex || "컬러 정보 없음"}
              </p>
            </div>
          </CardContent>
        </Card>

        {detailItems.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {detailItems.map((item) => (
              <Card key={item.label} className="rounded-2xl shadow-none">
                <CardContent className="p-4">
                  <p className="text-xs leading-5 text-brown-300">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-brown-600">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        <Button
          type="button"
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            if (product.productUrl) {
              window.location.href = product.productUrl;
            }
          }}
          disabled={!product.productUrl}
        >
          구매하러 가기
          <HiArrowTopRightOnSquare className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </DialogShell>
  );
}
