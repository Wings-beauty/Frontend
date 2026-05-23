import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiChevronRight,
  HiMiniUser,
  HiShieldCheck,
} from "react-icons/hi2";
import { getCurrentUser, requireAdmin, setAuthReturnTo } from "../api/auth";
import {
  fetchAdminUserDetail,
  type AdminUserDetail as AdminUserDetailData,
} from "../api/adminUsers";
import {
  getInquiryCategoryLabel,
  getInquiryStatusLabel,
  profileRoleLabels,
} from "../constants/inquiries";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPrice(value: number | null) {
  if (value === null) {
    return "가격 정보 없음";
  }

  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatConfidence(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${Math.round(value * 100)}%`;
}

export default function AdminUserDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const userIdentifier = id ? decodeURIComponent(id) : "";
  const [userDetail, setUserDetail] = useState<AdminUserDetailData | null>(null);
  const [expandedRawResults, setExpandedRawResults] = useState<Set<number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadUserDetail = async () => {
      if (!id) {
        setErrorMessage("회원 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!user) {
          setAuthReturnTo(`/admin/users/${encodeURIComponent(userIdentifier)}`);
          navigate("/login", { replace: true });
          return;
        }

        await requireAdmin();
        const nextUserDetail = await fetchAdminUserDetail(userIdentifier);

        if (isMounted) {
          setUserDetail(nextUserDetail);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "회원 상세를 불러오지 못했어요.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadUserDetail();

    return () => {
      isMounted = false;
    };
  }, [navigate, userIdentifier]);

  const toggleRawResult = (diagnosisId: number) => {
    setExpandedRawResults((current) => {
      const next = new Set(current);

      if (next.has(diagnosisId)) {
        next.delete(diagnosisId);
      } else {
        next.add(diagnosisId);
      }

      return next;
    });
  };

  return (
    <main className="min-h-dvh bg-white px-5 pb-12 pt-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="회원 목록으로 이동"
          onClick={() => navigate("/admin/users")}
        >
          <HiArrowLeft className="size-6" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-normal leading-7.5 text-[#1f1b1b]">
          회원 상세
        </h1>
        <div className="flex size-10 items-center justify-center rounded-full bg-cream-100 text-brown-600">
          <HiShieldCheck className="size-6" aria-hidden="true" />
        </div>
      </header>

      {isLoading ? (
        <section className="mt-10 rounded-3xl bg-cream-50 px-6 py-8">
          <p className="text-base font-normal leading-7 text-[#7a625c]">
            회원 정보를 불러오는 중입니다.
          </p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="mt-10 rounded-3xl bg-cream-50 px-6 py-8">
          <p className="text-base font-normal leading-7 text-[#c4544a]">
            {errorMessage}
          </p>
        </section>
      ) : null}

      {!isLoading && !errorMessage && !userDetail ? (
        <section className="mt-10 rounded-3xl bg-cream-50 px-6 py-8">
          <p className="text-base font-normal leading-7 text-[#7a625c]">
            회원을 찾을 수 없습니다.
          </p>
        </section>
      ) : null}

      {userDetail ? (
        <section className="mt-10 space-y-8">
          <article className="rounded-3xl bg-white px-6 py-7 shadow-lg">
            <div className="flex items-center gap-5">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream-100">
                {userDetail.profileImageUrl ? (
                  <img
                    src={userDetail.profileImageUrl}
                    className="size-full object-cover"
                    alt="프로필"
                  />
                ) : (
                  <HiMiniUser
                    className="size-12 text-brown-400"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-normal leading-5 text-[#df7e8b]">
                  {profileRoleLabels[userDetail.role]} ·{" "}
                  {userDetail.hasWaitlist ? "알림 신청" : "알림 미신청"}
                </p>
                <h2 className="mt-2 truncate text-2xl font-normal leading-8 text-brown-600">
                  {userDetail.nickname ?? "닉네임 없음"}
                </h2>
                <p className="mt-2 truncate text-sm font-normal leading-5 text-[#7a625c]">
                  {userDetail.email ?? "이메일 없음"}
                </p>
              </div>
            </div>
            <dl className="mt-7 grid grid-cols-2 gap-4 text-sm font-normal leading-5">
              <div>
                <dt className="text-[#9b8179]">User ID</dt>
                <dd className="mt-1 break-all text-brown-600">{userDetail.displayId}</dd>
              </div>
              <div>
                <dt className="text-[#9b8179]">출생연도</dt>
                <dd className="mt-1 text-brown-600">
                  {userDetail.birthYear ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-[#9b8179]">가입일</dt>
                <dd className="mt-1 text-brown-600">
                  {formatDate(userDetail.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[#9b8179]">수정일</dt>
                <dd className="mt-1 text-brown-600">
                  {formatDate(userDetail.updatedAt)}
                </dd>
              </div>
            </dl>
            <p className="mt-5 whitespace-pre-wrap text-sm font-normal leading-6 text-[#7a625c]">
              {userDetail.skinNote || "피부 메모 없음"}
            </p>
          </article>

          <section>
            <h3 className="text-2xl font-normal leading-8 text-brown-600">
              진단 이력
            </h3>
            <div className="mt-4 space-y-4">
              {userDetail.diagnosisResults.length === 0 ? (
                <article className="rounded-3xl bg-cream-50 px-6 py-7">
                  <p className="text-base font-normal leading-7 text-[#7a625c]">
                    진단 이력이 없습니다.
                  </p>
                </article>
              ) : null}

              {userDetail.diagnosisResults.map((diagnosis) => (
                <article
                  key={diagnosis.id}
                  className="rounded-3xl bg-white px-6 py-6 shadow-md"
                >
                  <p className="text-sm font-normal leading-5 text-[#df7e8b]">
                    {diagnosis.toneLabel ?? diagnosis.toneCode ?? "톤 정보 없음"} ·{" "}
                    {formatConfidence(diagnosis.confidence)}
                  </p>
                  <p className="mt-2 text-sm font-normal leading-5 text-[#7a625c]">
                    {formatDate(diagnosis.createdAt)}
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-full bg-cream-100 px-4 py-2 text-sm font-normal leading-5 text-brown-600"
                    onClick={() => toggleRawResult(diagnosis.id)}
                  >
                    {expandedRawResults.has(diagnosis.id)
                      ? "raw_result 접기"
                      : "raw_result 보기"}
                  </button>
                  {expandedRawResults.has(diagnosis.id) ? (
                    <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-[#2f2523] p-4 text-xs leading-5 text-white">
                      {JSON.stringify(diagnosis.rawResult, null, 2)}
                    </pre>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-normal leading-8 text-brown-600">
              찜한 상품
            </h3>
            <div className="mt-4 space-y-4">
              {userDetail.savedProducts.length === 0 ? (
                <article className="rounded-3xl bg-cream-50 px-6 py-7">
                  <p className="text-base font-normal leading-7 text-[#7a625c]">
                    찜한 상품이 없습니다.
                  </p>
                </article>
              ) : null}

              {userDetail.savedProducts.map((savedProduct) => (
                <article
                  key={savedProduct.id}
                  className="flex gap-4 rounded-3xl bg-white px-5 py-5 shadow-md"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-cream-50">
                    {savedProduct.productImageUrl ? (
                      <img
                        src={savedProduct.productImageUrl}
                        className="size-full object-cover"
                        alt={savedProduct.productName ?? "상품"}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-normal leading-5 text-[#7a625c]">
                      {savedProduct.brandName ?? "브랜드 없음"}
                    </p>
                    <h4 className="mt-1 line-clamp-2 text-base font-normal leading-6 text-brown-600">
                      {savedProduct.productName ?? "상품명 없음"}
                    </h4>
                    <p className="mt-2 text-sm font-normal leading-5 text-[#7a625c]">
                      {savedProduct.productColor ??
                        savedProduct.category ??
                        "색상 정보 없음"}{" "}
                      · {formatPrice(savedProduct.price)}
                    </p>
                    <p className="mt-1 text-xs font-normal leading-5 text-[#9b8179]">
                      찜한 날짜 {formatDate(savedProduct.savedAt)}
                    </p>
                    {savedProduct.productUrl ? (
                      <a
                        href={savedProduct.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex rounded-full bg-cream-100 px-4 py-1.5 text-sm font-normal leading-5 text-brown-600"
                      >
                        상품 열기
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-normal leading-8 text-brown-600">
              문의 내역
            </h3>
            <div className="mt-4 space-y-4">
              {userDetail.inquiries.length === 0 ? (
                <article className="rounded-3xl bg-cream-50 px-6 py-7">
                  <p className="text-base font-normal leading-7 text-[#7a625c]">
                    문의 내역이 없습니다.
                  </p>
                </article>
              ) : null}

              {userDetail.inquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  type="button"
                  className="flex w-full items-start gap-4 rounded-3xl bg-white px-5 py-5 text-left shadow-md"
                  onClick={() => navigate(`/admin/inquiries/${inquiry.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-normal leading-5 text-[#df7e8b]">
                      {getInquiryCategoryLabel(inquiry.category)} ·{" "}
                      {getInquiryStatusLabel(inquiry.status)}
                    </p>
                    <h4 className="mt-2 truncate text-base font-normal leading-6 text-brown-600">
                      {inquiry.title}
                    </h4>
                    <p className="mt-2 text-sm font-normal leading-5 text-[#7a625c]">
                      작성 {formatDate(inquiry.createdAt)} · 답변{" "}
                      {formatDate(inquiry.repliedAt)}
                    </p>
                  </div>
                  <HiChevronRight
                    className="mt-2 size-5 shrink-0 text-[#9b8179]"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </section>
        </section>
      ) : null}
    </main>
  );
}
