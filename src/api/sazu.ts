export type SazuInput = {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  birthMinute?: number;
  isFemale: boolean;
  isLunar: boolean;
  isLeapMonth?: boolean;
  birthCity?: string;
};

export type SazuAnalysis = {
  modules: Record<string, Record<string, unknown> | undefined>;
  timezone: { city: string; mode: "convention" | "trueSolar" };
};

type SazuApiResponse =
  | { ok: true; data: SazuAnalysis }
  | { ok: false; message?: string };

export async function requestSazuAnalysis(input: SazuInput): Promise<SazuAnalysis> {
  const response = await fetch("/api/sazu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as SazuApiResponse;

  if (!response.ok || !payload.ok) {
    throw new Error(
      "message" in payload && payload.message
        ? payload.message
        : "사주 분석을 완료하지 못했어요.",
    );
  }

  return payload.data;
}
