"use client";

import { HiArrowTopRightOnSquare, HiHeart, HiPaintBrush, HiShoppingBag } from "react-icons/hi2";
import type { RecommendedProduct } from "../api/products";
import { getProductCategoryLabel } from "../constants/products";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

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
    { label: "추천 톤", value: product.toneType },
    { label: "세부 톤", value: product.detailedTone },
    { label: "립 타입", value: product.lipType },
    { label: "텍스처", value: product.texture },
    { label: "추천 피부 타입", value: product.recommendedSkinType },
  ].filter((item) => item.value);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-24px)] max-w-2xl overflow-hidden p-0" showCloseButton>
        <div className="max-h-[calc(100dvh-24px)] overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="mb-4 flex min-w-0 items-center gap-2 pr-12 text-sm text-brown-300">
            <HiShoppingBag className="size-5 shrink-0" aria-hidden="true" />
            <span className="truncate">상품 정보</span>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white sm:aspect-[16/10]">
            {product.productImageUrl ? (
              <img src={product.productImageUrl} className="size-full object-cover" alt={product.productName} />
            ) : (
              <div className="size-full" style={{ backgroundColor: product.colorHex ?? "#fff9e6" }} />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brown-600/55 to-transparent px-4 pb-4 pt-16">
              <div className="flex min-w-0 items-center gap-2 text-sm leading-5 text-white">
                <span className="size-4 shrink-0 rounded-full border border-white/70" style={{ backgroundColor: product.colorHex ?? "#fff9e6" }} aria-hidden="true" />
                <span className="min-w-0 truncate">{product.productColor || product.colorHex || "대표 컬러"}</span>
              </div>
            </div>

            {onToggleLike ? (
              <Button
                type="button"
                variant={isLiked ? "default" : "secondary"}
                size="icon"
                className="absolute right-3 top-3 shadow-sm"
                aria-label={isLiked ? `${product.productName} 찜 해제` : `${product.productName} 찜하기`}
                onClick={() => onToggleLike(product.id)}
              >
                <HiHeart className={`size-5 ${isLiked ? "fill-current" : ""}`} aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge className="bg-white text-brown-300">{getProductCategoryLabel(product.category) || "상품"}</Badge>
            {product.toneType ? (
              <Badge className="bg-white text-brown-300">
                <HiPaintBrush className="size-4" aria-hidden="true" />
                {product.toneType}
              </Badge>
            ) : null}
          </div>

          <DialogHeader className="mt-5">
            <DialogDescription className="break-words text-base leading-6">{product.brandName}</DialogDescription>
            <DialogTitle className="break-keep text-2xl leading-9 sm:text-3xl sm:leading-10">{product.productName}</DialogTitle>
          </DialogHeader>
          {product.price ? <p className="mt-4 text-xl leading-8 text-brown-600">{formatPrice(product.price)}</p> : null}

          <Card className="mt-5 rounded-2xl border-none bg-white shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ivory bg-white"
                style={{ backgroundColor: product.colorHex ?? "#fff9e6" }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm leading-5 text-brown-300">대표 컬러</p>
                <p className="mt-1 break-words text-base leading-6 text-brown-600">{product.productColor || product.colorHex || "컬러 정보 없음"}</p>
              </div>
            </CardContent>
          </Card>

          {detailItems.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {detailItems.map((item) => (
                <div key={item.label} className="min-w-0 rounded-2xl border border-cream-200/80 bg-white px-4 py-3">
                  <p className="text-xs leading-5 text-brown-300">{item.label}</p>
                  <p className="mt-1 break-words text-sm leading-6 text-brown-600">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="sticky bottom-0 mt-6 bg-white pt-3">
            <Button
              type="button"
              size="lg"
              className="w-full"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
