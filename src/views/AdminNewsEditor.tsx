"use client";

import { useEffect, useMemo, useState } from "react";
import { HiArrowDown, HiArrowLeft, HiArrowUp, HiArrowUpTray, HiCheck, HiEye, HiLink, HiPhoto, HiPlus, HiTrash, HiXMark } from "react-icons/hi2";
import { createEmptyDocument, createEmptySlide, fetchAdminNewsDetail, saveNews, uploadNewsImage, type CardNewsDocument, type CardNewsSlide } from "../api/news";
import { getCurrentUser, requireAdmin, setAuthReturnTo } from "../api/auth";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useNavigate, useParams } from "../lib/router";

type SaveMode = "draft" | "save" | "publish";

const toneOptions = [
  { value: "all", label: "전체" },
  { value: "spring", label: "봄 웜" },
  { value: "summer", label: "여름 쿨" },
  { value: "autumn", label: "가을 웜" },
  { value: "winter", label: "겨울 쿨" },
];

function getSlideLabel(index: number) {
  return `${index + 1}번 슬라이드`;
}

function getCoverImage(thumbnailUrl: string, document: CardNewsDocument) {
  return thumbnailUrl || document.slides.find((slide) => slide.imageUrl)?.imageUrl || "";
}

export default function AdminNewsEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const newsId = Number(id);
  const isEditing = Number.isFinite(newsId);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("뷰티");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [document, setDocument] = useState<CardNewsDocument>(() => createEmptyDocument());
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const coverImage = useMemo(() => getCoverImage(thumbnailUrl, document), [document, thumbnailUrl]);

  useEffect(() => {
    let isMounted = true;

    const checkAdminAndLoad = async () => {
      const user = await getCurrentUser();

      if (!user) {
        setAuthReturnTo(isEditing ? `/admin/news/${newsId}` : "/admin/news/new");
        navigate("/login", { replace: true });
        return;
      }

      try {
        await requireAdmin();

        if (isEditing) {
          const item = await fetchAdminNewsDetail(newsId);

          if (item && isMounted) {
            setTitle(item.title);
            setCategory(item.category ?? "뷰티");
            setThumbnailUrl(item.thumbnailUrl ?? "");
            setDocument(item.document);
            setIsPublished(item.isPublished);
          }
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "뉴스 정보를 불러오지 못했어요.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void checkAdminAndLoad();

    return () => {
      isMounted = false;
    };
  }, [isEditing, navigate, newsId]);

  const updateDocument = (updater: (current: CardNewsDocument) => CardNewsDocument) => {
    setDocument((current) => updater(current));
  };

  const updateSlide = (slideId: string, patch: Partial<CardNewsSlide>) => {
    updateDocument((current) => ({
      ...current,
      slides: current.slides.map((slide) => (slide.id === slideId ? { ...slide, ...patch } : slide)),
    }));
  };

  const moveSlide = (slideId: string, direction: -1 | 1) => {
    updateDocument((current) => {
      const index = current.slides.findIndex((slide) => slide.id === slideId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.slides.length) {
        return current;
      }

      const slides = [...current.slides];
      const [slide] = slides.splice(index, 1);
      slides.splice(nextIndex, 0, slide);

      return { ...current, slides };
    });
  };

  const removeSlide = (slideId: string) => {
    updateDocument((current) => ({
      ...current,
      slides: current.slides.length > 1 ? current.slides.filter((slide) => slide.id !== slideId) : current.slides,
    }));
  };

  const handleImageUpload = async (file: File | undefined, target: "thumbnail" | string) => {
    if (!file) {
      return;
    }

    setUploadingKey(target);
    setErrorMessage("");

    try {
      const imageUrl = await uploadNewsImage(file);

      if (target === "thumbnail") {
        setThumbnailUrl(imageUrl);
        return;
      }

      updateSlide(target, { imageUrl });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "이미지를 업로드하지 못했어요.");
    } finally {
      setUploadingKey("");
    }
  };

  const handleSave = async (mode: SaveMode) => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const nextPublished = mode === "publish" ? true : mode === "draft" ? false : isPublished;
      const nextId = await saveNews(
        {
          title,
          category,
          thumbnailUrl,
          document,
          isPublished: nextPublished,
        },
        isEditing ? newsId : undefined,
      );

      if (mode === "publish") {
        navigate(`/news/${nextId}`, { replace: true });
        return;
      }

      navigate(`/admin/news/${nextId}`, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "뉴스를 저장하지 못했어요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-dvh app-page px-5 py-5 lg:px-8 lg:py-7">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-3xl border border-cream-200 bg-white px-4 py-3 lg:px-6">
          <Button type="button" variant="ghost" size="icon" aria-label="뉴스 목록으로 이동" onClick={() => navigate("/news")}>
            <HiArrowLeft className="size-6" aria-hidden="true" />
          </Button>
          <h1 className="text-2xl leading-7 text-brown-600">{isEditing ? "카드뉴스 수정" : "카드뉴스 등록"}</h1>
          <Badge className={isPublished ? "bg-green text-white" : "bg-white text-brown-300"}>{isPublished ? "발행됨" : "임시저장"}</Badge>
        </header>

        {isLoading ? <div className="h-96 app-card" /> : null}

        {!isLoading ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
            <section className="flex min-w-0 flex-col gap-5">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <label className="block">
                    <span className="text-sm leading-5 text-brown-300">제목</span>
                    <Input className="mt-2" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="카드뉴스 제목" />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm leading-5 text-brown-300">카테고리</span>
                      <Input className="mt-2" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="뷰티, 톤 리포트..." />
                    </label>
                    <div className="space-y-2">
                      <span className="text-sm leading-5 text-brown-300">대표 이미지</span>
                      {/* 파일 첨부 */}
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm text-brown-500 transition hover:bg-cream-50">
                        <HiArrowUpTray className="size-4 shrink-0" />
                        <span>{uploadingKey === "thumbnail" ? "업로드 중…" : "파일 첨부"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={Boolean(uploadingKey)}
                          onChange={(e) => void handleImageUpload(e.target.files?.[0], "thumbnail")}
                        />
                      </label>
                      {/* URL 입력 */}
                      <div className="relative">
                        <HiLink className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brown-300" />
                        <Input
                          value={thumbnailUrl}
                          onChange={(e) => setThumbnailUrl(e.target.value)}
                          placeholder="이미지 URL 붙여넣기"
                          className="pl-9 text-xs"
                        />
                      </div>
                      <p className="text-[11px] leading-4 text-brown-300">권장 1080 × 1350px · 4:5 · 최소 720 × 900px</p>
                    </div>
                  </div>
                  {thumbnailUrl ? (
                    <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl bg-cream-100">
                      <img src={thumbnailUrl} alt="" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setThumbnailUrl("")}
                        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                        aria-label="대표 이미지 제거"
                      >
                        <HiXMark className="size-3.5" />
                      </button>
                    </div>
                  ) : null}
                  <label className="block">
                    <span className="text-sm leading-5 text-brown-300">요약 <span className="text-brown-200">(뉴스 목록에 표시)</span></span>
                    <Textarea
                      className="mt-2"
                      rows={3}
                      value={document.summary}
                      onChange={(event) => updateDocument((current) => ({ ...current, summary: event.target.value }))}
                      placeholder="뉴스 목록 카드에 표시될 한두 줄 요약을 입력하세요."
                    />
                  </label>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>SEO 메타</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Input value={document.seo.title} onChange={(event) => updateDocument((current) => ({ ...current, seo: { ...current.seo, title: event.target.value } }))} placeholder="SEO 제목" />
                  <Textarea
                    value={document.seo.description}
                    onChange={(event) => updateDocument((current) => ({ ...current, seo: { ...current.seo, description: event.target.value } }))}
                    placeholder="SEO 설명"
                  />
                  <Input
                    value={document.seo.keywords}
                    onChange={(event) => updateDocument((current) => ({ ...current, seo: { ...current.seo, keywords: event.target.value } }))}
                    placeholder="키워드, 쉼표로 구분"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle>노출 설정</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-brown-600">
                    <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />
                    공개 상태
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-brown-600">
                    <input
                      type="checkbox"
                      checked={document.exposure.isFeatured}
                      onChange={(event) => updateDocument((current) => ({ ...current, exposure: { ...current.exposure, isFeatured: event.target.checked } }))}
                    />
                    홈 주요 노출
                  </label>
                  <select
                    className="h-12 rounded-2xl border border-cream-200 bg-white px-4 text-brown-600 outline-none"
                    value={document.exposure.targetTone}
                    onChange={(event) => updateDocument((current) => ({ ...current, exposure: { ...current.exposure, targetTone: event.target.value } }))}
                  >
                    {toneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>카드뉴스 슬라이드 편집기</CardTitle>
                  <Button type="button" variant="outline" onClick={() => updateDocument((current) => ({ ...current, slides: [...current.slides, createEmptySlide()] }))}>
                    <HiPlus className="size-5" aria-hidden="true" />
                    슬라이드 추가
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {document.slides.map((slide, index) => (
                    <article key={slide.id} className="rounded-3xl border border-cream-200 bg-white p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-base leading-6 text-brown-600">{getSlideLabel(index)}</p>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="icon" aria-label="위로 이동" onClick={() => moveSlide(slide.id, -1)} disabled={index === 0}>
                            <HiArrowUp className="size-4" />
                          </Button>
                          <Button type="button" variant="outline" size="icon" aria-label="아래로 이동" onClick={() => moveSlide(slide.id, 1)} disabled={index === document.slides.length - 1}>
                            <HiArrowDown className="size-4" />
                          </Button>
                          <Button type="button" variant="outline" size="icon" aria-label="삭제" onClick={() => removeSlide(slide.id)} disabled={document.slides.length === 1}>
                            <HiTrash className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
                        <div className="space-y-2">
                          {/* 미리보기 */}
                          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream-100">
                            {slide.imageUrl ? (
                              <img src={slide.imageUrl} alt="" className="size-full object-cover" />
                            ) : (
                              <div className="flex size-full items-center justify-center text-brown-300">
                                <HiPhoto className="size-8" />
                              </div>
                            )}
                            {uploadingKey === slide.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/75">
                                <span className="text-xs text-brown-400">업로드 중…</span>
                              </div>
                            )}
                            {slide.imageUrl && uploadingKey !== slide.id && (
                              <button
                                type="button"
                                onClick={() => updateSlide(slide.id, { imageUrl: "" })}
                                className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                                aria-label="이미지 제거"
                              >
                                <HiXMark className="size-3.5" />
                              </button>
                            )}
                          </div>

                          {/* 파일 첨부 */}
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm text-brown-500 transition hover:bg-cream-50">
                            <HiArrowUpTray className="size-4 shrink-0" />
                            <span>{uploadingKey === slide.id ? "업로드 중…" : "파일 첨부"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              disabled={Boolean(uploadingKey)}
                              onChange={(e) => void handleImageUpload(e.target.files?.[0], slide.id)}
                            />
                          </label>

                          {/* URL 입력 */}
                          <div className="relative">
                            <HiLink className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brown-300" />
                            <Input
                              value={slide.imageUrl}
                              onChange={(e) => updateSlide(slide.id, { imageUrl: e.target.value })}
                              placeholder="이미지 URL 붙여넣기"
                              className="pl-9 text-xs"
                            />
                          </div>

                          <p className="text-[11px] leading-4 text-brown-300">권장 1080 × 1350px · 4:5</p>
                        </div>
                        <div className="grid gap-3">
                          <Input value={slide.title} onChange={(event) => updateSlide(slide.id, { title: event.target.value })} placeholder="슬라이드 제목" />
                          <Textarea className="min-h-40" value={slide.body} onChange={(event) => updateSlide(slide.id, { body: event.target.value })} placeholder="슬라이드 본문" />
                        </div>
                      </div>
                    </article>
                  ))}
                </CardContent>
              </Card>

              {errorMessage ? <p className="rounded-2xl bg-red/5 px-4 py-3 text-sm leading-6 text-red">{errorMessage}</p> : null}

              <div className="grid gap-3 md:grid-cols-3">
                <Button type="button" variant="outline" size="lg" onClick={() => void handleSave("draft")} disabled={isSaving || Boolean(uploadingKey)}>
                  임시저장
                </Button>
                <Button type="button" variant="secondary" size="lg" onClick={() => void handleSave("save")} disabled={isSaving || Boolean(uploadingKey)}>
                  저장
                </Button>
                <Button type="button" size="lg" onClick={() => void handleSave("publish")} disabled={isSaving || Boolean(uploadingKey)}>
                  발행
                  <HiCheck className="size-5" aria-hidden="true" />
                </Button>
              </div>
            </section>

            <aside className="xl:sticky xl:top-6 xl:self-start">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HiEye className="size-5" aria-hidden="true" />
                    모바일 미리보기
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mx-auto w-full max-w-[22rem] rounded-[2rem] border border-brown-600/10 bg-white p-3 shadow-[0_20px_60px_rgb(58_37_39/0.12)]">
                    <div className="overflow-hidden rounded-[1.5rem] bg-white">
                      <div className="relative aspect-[4/5] bg-cream-100">
                        {coverImage ? (
                          <img src={coverImage} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-brown-300">
                            <HiPhoto className="size-10" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brown-600/70 to-transparent px-4 pb-4 pt-20 text-white">
                          {category ? <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-brown-600">{category}</span> : null}
                          <h2 className="mt-3 break-keep text-2xl leading-8">{title || "카드뉴스 제목"}</h2>
                        </div>
                      </div>
                      <div className="space-y-3 p-4">
                        {document.slides.slice(0, 3).map((slide, index) => (
                          <div key={slide.id} className="rounded-2xl bg-white p-4">
                            <p className="text-xs text-brown-300">
                              {index + 1}/{document.slides.length}
                            </p>
                            <h3 className="mt-2 break-keep text-lg leading-7 text-brown-600">{slide.title || "슬라이드 제목"}</h3>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#756861]">{slide.body || "슬라이드 본문 미리보기"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}
