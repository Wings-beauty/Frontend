import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { HiArrowLeft, HiSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { requestSazuAnalysis, type SazuAnalysis } from "../api/sazu";
import { Button } from "../components/ui/button";

type FormState = {
  birthDate: string;
  birthTime: string;
  hourUnknown: boolean;
  isFemale: boolean;
  isLunar: boolean;
  isLeapMonth: boolean;
  birthCity: string;
};

const initialForm: FormState = {
  birthDate: "",
  birthTime: "12:00",
  hourUnknown: false,
  isFemale: false,
  isLunar: false,
  isLeapMonth: false,
  birthCity: "서울",
};

const elementKeys = ["wood", "fire", "earth", "metal", "water"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "-";
}

function getRecord(value: unknown, key: string): Record<string, unknown> | undefined {
  return isRecord(value) && isRecord(value[key]) ? value[key] : undefined;
}

function ResultSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_10px_30px_rgb(58_37_39/0.08)]">
      <h2 className="text-xl font-semibold text-brown-600">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Sazu() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<SazuAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fourPillars = result?.modules.fourPillars;
  const elements = result?.modules.elements;
  const sinStrength = result?.modules.sinStrength;
  const decadeFortune = result?.modules.decadeFortune;
  const summary = result?.modules.summary;

  const pillars = useMemo(
    () =>
      [
        ["년주", "year"],
        ["월주", "month"],
        ["일주", "day"],
        ["시주", "hour"],
      ].map(([label, key]) => ({ label, value: text(getRecord(fourPillars, key)?.full) })),
    [fourPillars],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const [year, month, day] = form.birthDate.split("-").map(Number);
    const [hour, minute] = form.birthTime.split(":").map(Number);
    const validDate =
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      new Date(year, month - 1, day).getFullYear() === year &&
      new Date(year, month - 1, day).getMonth() === month - 1 &&
      new Date(year, month - 1, day).getDate() === day;

    if (!validDate || year < 1900 || year > 2100 || (!form.hourUnknown && (!Number.isInteger(hour) || !Number.isInteger(minute)))) {
      setErrorMessage("출생일과 시간을 다시 확인해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await requestSazuAnalysis({
        birthYear: year,
        birthMonth: month,
        birthDay: day,
        birthHour: form.hourUnknown ? null : hour,
        birthMinute: form.hourUnknown ? undefined : minute,
        isFemale: form.isFemale,
        isLunar: form.isLunar,
        isLeapMonth: form.isLunar ? form.isLeapMonth : false,
        birthCity: form.birthCity,
      });
      setResult(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "사주 분석을 완료하지 못했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100svh] bg-white px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-brown-600">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between">
          <button type="button" className="flex size-10 items-center justify-center rounded-full text-brown-600" aria-label="이전 페이지로 이동" onClick={() => navigate(-1)}>
            <HiArrowLeft className="size-6" aria-hidden="true" />
          </button>
          <p className="text-lg font-semibold tracking-[-0.04em]">WINGS</p>
          <div className="size-10" aria-hidden="true" />
        </header>

        <section className="mt-8 rounded-[2rem] bg-brown-600 px-6 py-7 text-white shadow-[0_16px_36px_rgb(58_37_39/0.2)]">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-cream-300"><HiSparkles className="size-4" aria-hidden="true" />SAZU ANALYSIS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">나의 사주 분석</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">출생 정보를 바탕으로 사주 원국과 오행 흐름을 확인해보세요.</p>
        </section>

        <form className="mt-6 space-y-5 rounded-3xl bg-white p-6 shadow-[0_10px_30px_rgb(58_37_39/0.08)]" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold" htmlFor="birth-date">생년월일</label>
            <input id="birth-date" type="date" required value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 outline-none focus:border-brown-400" />
          </div>

          <div>
            <div className="flex items-center justify-between"><label className="text-sm font-semibold" htmlFor="birth-time">태어난 시각</label><label className="flex items-center gap-2 text-sm text-[#7a625c]"><input type="checkbox" checked={form.hourUnknown} onChange={(event) => setForm({ ...form, hourUnknown: event.target.checked })} />모름</label></div>
            <input id="birth-time" type="time" disabled={form.hourUnknown} value={form.birthTime} onChange={(event) => setForm({ ...form, birthTime: event.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 outline-none disabled:opacity-50 focus:border-brown-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold">성별<select value={form.isFemale ? "female" : "male"} onChange={(event) => setForm({ ...form, isFemale: event.target.value === "female" })} className="mt-2 h-12 w-full rounded-2xl border border-cream-200 bg-cream-50 px-3 font-normal outline-none"><option value="male">남성</option><option value="female">여성</option></select></label>
            <label className="text-sm font-semibold">달력<select value={form.isLunar ? "lunar" : "solar"} onChange={(event) => setForm({ ...form, isLunar: event.target.value === "lunar", isLeapMonth: event.target.value === "lunar" ? form.isLeapMonth : false })} className="mt-2 h-12 w-full rounded-2xl border border-cream-200 bg-cream-50 px-3 font-normal outline-none"><option value="solar">양력</option><option value="lunar">음력</option></select></label>
          </div>

          {form.isLunar ? <label className="flex items-center gap-2 text-sm text-[#7a625c]"><input type="checkbox" checked={form.isLeapMonth} onChange={(event) => setForm({ ...form, isLeapMonth: event.target.checked })} />윤달 출생이에요</label> : null}

          <div><label className="text-sm font-semibold" htmlFor="birth-city">출생 도시 <span className="font-normal text-[#7a625c]">(선택)</span></label><input id="birth-city" value={form.birthCity} onChange={(event) => setForm({ ...form, birthCity: event.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 outline-none focus:border-brown-400" placeholder="서울" /></div>

          <p className="rounded-2xl bg-cream-50 px-4 py-3 text-xs leading-5 text-[#7a625c]">입력한 출생 정보는 사주 분석 요청에만 사용되며, WINGS는 이 기능에서 저장하지 않습니다.</p>
          {errorMessage ? <p role="alert" className="text-sm text-[#c4544a]">{errorMessage}</p> : null}
          <Button className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? "분석 중..." : "사주 분석하기"}</Button>
        </form>

        {result ? <div className="mt-6 space-y-5 pb-8">
          <p className="text-center text-sm text-[#7a625c]">{result.timezone.city} 기준 · {result.timezone.mode === "trueSolar" ? "진태양시" : "한국 만세력 관습"} 보정</p>
          <ResultSection title="사주 원국"><div className="grid grid-cols-4 gap-2">{pillars.map((pillar) => <div key={pillar.label} className="rounded-2xl bg-cream-50 px-2 py-4 text-center"><p className="text-xs text-[#7a625c]">{pillar.label}</p><p className="mt-2 text-lg font-semibold">{pillar.value}</p></div>)}</div></ResultSection>
          <ResultSection title="오행 분포"><div className="space-y-3">{elementKeys.map((key) => { const element = getRecord(elements, key); const total = getRecord(element, "total"); const percentage = typeof total?.percentage === "number" ? total.percentage : 0; return <div key={key}><div className="flex justify-between text-sm"><span>{text(element?.name)}</span><span>{percentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-cream-100"><div className="h-full rounded-full bg-[#c77769]" style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} /></div></div>; })}</div></ResultSection>
          <ResultSection title="신강 · 신약"><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-cream-50 p-4"><p className="text-xs text-[#7a625c]">판정</p><p className="mt-2 text-lg font-semibold">{text(sinStrength?.level)}</p></div><div className="rounded-2xl bg-cream-50 p-4"><p className="text-xs text-[#7a625c]">점수</p><p className="mt-2 text-lg font-semibold">{text(sinStrength?.score)}</p></div></div></ResultSection>
          <ResultSection title="대운"><div className="flex items-center justify-between rounded-2xl bg-cream-50 p-4"><div><p className="text-sm text-[#7a625c]">{text(decadeFortune?.direction)} · 시작 나이</p><p className="mt-1 text-lg font-semibold">{text(decadeFortune?.startAge)}세</p></div><p className="text-sm text-[#7a625c]">{Array.isArray(decadeFortune?.list) ? `${decadeFortune.list.length}개 흐름` : "-"}</p></div></ResultSection>
          <ResultSection title="분석 요약"><p className="text-sm leading-6 text-[#5f4b45]">일간 {text(getRecord(summary, "dayMaster")?.char)} · 강한 오행 {text(getRecord(summary, "elementBalance")?.dominant)} · 부족한 오행 {text(getRecord(summary, "elementBalance")?.lacking)}</p></ResultSection>
          <ResultSection title="Gemini 해석"><p className="whitespace-pre-line text-sm leading-7 text-[#5f4b45]">{result.interpretation}</p></ResultSection>
        </div> : null}
      </div>
    </main>
  );
}
