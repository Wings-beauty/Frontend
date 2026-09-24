import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowPath, HiChevronLeft } from "react-icons/hi2";
import { getCurrentUser, setAuthReturnTo } from "../api/auth";
import { fetchPopupAdminStats, type PopupAdminStats } from "../api/popupAdmin";
import { POPUP_EVENT } from "../constants/popup";
import { useWideLayout } from "../hooks/usePopupMotion";

function formatPercent(value: number | null) {
  return value === null ? "-" : `${Math.round(value * 100)}%`;
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function KpiCard({
  label,
  value,
  base,
}: {
  label: string;
  value: number;
  base: number;
}) {
  return (
    <div className="rounded-3xl bg-cream-50 px-5 py-5">
      <p className="text-sm text-[#7a625c]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-brown-600">
        {value.toLocaleString("ko-KR")}
      </p>
      <p className="mt-1 text-xs text-[#9b8179]">
        방문자 대비 {base > 0 ? formatPercent(value / base) : "-"}
      </p>
    </div>
  );
}

function TableCard({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-brown-600">{title}</h2>
      {note ? <p className="mt-1 text-xs leading-5 text-[#9b8179]">{note}</p> : null}
      <div className="mt-3 overflow-x-auto rounded-3xl border border-cream-200">{children}</div>
    </section>
  );
}

const cellClass = "whitespace-nowrap px-4 py-3 text-right tabular-nums";
const headClass = "whitespace-nowrap px-4 py-3 text-right font-medium";
const POLL_INTERVAL_MS = 15000;

export default function AdminPopup() {
  useWideLayout();

  const navigate = useNavigate();
  const [stats, setStats] = useState<PopupAdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true);
        setErrorMessage("");
      }

      try {
        const user = await getCurrentUser();

        if (!user) {
          setAuthReturnTo("/admin/popup");
          navigate("/login", { replace: true });
          return;
        }

        setStats(await fetchPopupAdminStats());
        setLastUpdatedAt(new Date());
        if (silent) setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "팝업 데이터를 불러오지 못했어요.",
        );
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => void load(true), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const maxSlot = Math.max(1, ...(stats?.timeSlots.map((slot) => slot.count) ?? [0]));
  const maxReason = Math.max(1, ...(stats?.reasons.map((item) => item.count) ?? [0]));

  return (
    <main className="mx-auto min-h-dvh w-full min-w-0 max-w-6xl bg-white px-5 pb-16 pt-6 sm:px-8">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="flex size-10 items-center justify-center text-brown-600"
          aria-label="관리자 홈으로 이동"
        >
          <HiChevronLeft className="size-7" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-normal text-[#1f1b1b]">팝업 데이터</h1>
        <button
          type="button"
          onClick={() => void load()}
          disabled={isLoading}
          className="flex size-10 items-center justify-center rounded-full bg-cream-100 text-brown-600 disabled:opacity-50"
          aria-label="새로고침"
        >
          <HiArrowPath className={`size-5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </header>
      <p className="mt-2 text-center text-xs text-[#9b8179]">행사 코드 {POPUP_EVENT.key}</p>
      <p className="mt-1 text-center text-[0.7rem] text-[#c2ac9f]">
        {lastUpdatedAt ? `마지막 업데이트 ${formatTime(lastUpdatedAt)} · ` : ""}
        15초마다 자동 갱신
      </p>

      {errorMessage ? (
        <p role="alert" className="mt-8 rounded-2xl bg-cream-50 px-5 py-4 text-sm text-red">
          {errorMessage}
        </p>
      ) : null}

      {isLoading && !stats ? (
        <p className="mt-10 text-center text-sm text-[#9b8179]">불러오는 중이에요.</p>
      ) : null}

      {stats ? (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard label="방문자" value={stats.totals.visitors} base={stats.totals.visitors} />
            <KpiCard label="퀴즈 완료" value={stats.totals.quizUsers} base={stats.totals.visitors} />
            <KpiCard label="방문 예정 등록" value={stats.totals.visitSlotUsers} base={stats.totals.visitors} />
            <KpiCard label="구매 설문 응답" value={stats.totals.surveyUsers} base={stats.totals.visitors} />
          </section>

          <TableCard
            title="제품별 반응"
            note="추천 노출은 추천 결과에 포함된 횟수, 나머지 사용자 지표는 고유 사용자 기준이에요. 찜 전환율은 (현재 찜한 사용자 ÷ 조회한 사용자)이며, 카드에서 바로 찜한 경우 100%를 넘을 수 있어요."
          >
            <table className="w-full min-w-[56rem] text-sm">
              <thead className="bg-cream-50 text-[#7a625c]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium">제품</th>
                  <th className={headClass}>추천 노출</th>
                  <th className={headClass}>추천 사용자</th>
                  <th className={headClass}>조회</th>
                  <th className={headClass}>고유 조회자</th>
                  <th className={headClass}>현재 찜</th>
                  <th className={headClass}>누적 찜</th>
                  <th className={headClass}>찜 전환율</th>
                  <th className={headClass}>구매 선택</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 text-brown-600">
                {stats.products.map((product) => (
                  <tr key={product.productKey}>
                    <td className="px-4 py-3">{product.label}</td>
                    <td className={cellClass}>{product.recommendCount}</td>
                    <td className={cellClass}>{product.recommendUsers}</td>
                    <td className={cellClass}>{product.viewCount}</td>
                    <td className={cellClass}>{product.viewUsers}</td>
                    <td className={cellClass}>{product.wishlistNow}</td>
                    <td className={cellClass}>{product.likeCount}</td>
                    <td className={cellClass}>{formatPercent(product.wishlistConversion)}</td>
                    <td className={cellClass}>{product.purchaseSurveyCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="유입 경로별 퍼널" note="최초 유입(first-touch) 기준, 고유 사용자 수예요.">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="bg-cream-50 text-[#7a625c]">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium">source</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-medium">campaign</th>
                  <th className={headClass}>방문자</th>
                  <th className={headClass}>퀴즈 완료</th>
                  <th className={headClass}>방문 예정</th>
                  <th className={headClass}>구매 설문</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 text-brown-600">
                {stats.sources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-[#9b8179]">
                      아직 방문 데이터가 없어요.
                    </td>
                  </tr>
                ) : (
                  stats.sources.map((source) => (
                    <tr key={`${source.source}-${source.campaign}`}>
                      <td className="px-4 py-3">{source.source}</td>
                      <td className="px-4 py-3">{source.campaign}</td>
                      <td className={cellClass}>{source.visitors}</td>
                      <td className={cellClass}>{source.quizUsers}</td>
                      <td className={cellClass}>{source.visitSlotUsers}</td>
                      <td className={cellClass}>{source.surveyUsers}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableCard>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-brown-600">방문 예정 시간대</h2>
              <ul className="mt-3 flex flex-col gap-3 rounded-3xl border border-cream-200 p-5">
                {stats.timeSlots.map((slot) => (
                  <li key={slot.value} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 tabular-nums text-[#7a625c]">{slot.label}</span>
                    <span className="h-3 flex-1 overflow-hidden rounded-full bg-cream-100">
                      <span
                        className="pu-progress-bar block h-full w-full rounded-full bg-brown-600"
                        style={{ transform: `scaleX(${slot.count / maxSlot})` }}
                      />
                    </span>
                    <span className="w-8 text-right tabular-nums">{slot.count}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-brown-600">구매 이유</h2>
              <ul className="mt-3 flex flex-col gap-3 rounded-3xl border border-cream-200 p-5">
                {stats.reasons.length === 0 ? (
                  <li className="text-sm text-[#9b8179]">아직 응답이 없어요.</li>
                ) : (
                  stats.reasons.map((item) => (
                    <li key={item.reason} className="flex items-center gap-3 text-sm">
                      <span className="w-44 shrink-0 truncate text-[#7a625c]">{item.reason}</span>
                      <span className="h-3 flex-1 overflow-hidden rounded-full bg-cream-100">
                        <span
                          className="pu-progress-bar block h-full w-full rounded-full bg-rose"
                          style={{ transform: `scaleX(${item.count / maxReason})` }}
                        />
                      </span>
                      <span className="w-8 text-right tabular-nums">{item.count}</span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-brown-600">최근 자유 의견</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {stats.recentComments.length === 0 ? (
                <li className="rounded-3xl border border-cream-200 p-5 text-sm text-[#9b8179]">
                  아직 의견이 없어요.
                </li>
              ) : (
                stats.recentComments.map((item, index) => (
                  <li key={`${item.createdAt}-${index}`} className="rounded-3xl bg-cream-50 p-5">
                    <p className="whitespace-pre-line text-sm leading-6 text-brown-600">
                      {item.comment}
                    </p>
                    <p className="mt-2 text-xs text-[#9b8179]">{formatDateTime(item.createdAt)}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      ) : null}
    </main>
  );
}
