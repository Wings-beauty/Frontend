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
  interpretation: string;
};

type SazuApiResponse =
  | { ok: true; data: SazuAnalysis }
  | { ok: false; message?: string };

export async function requestSazuAnalysis(input: SazuInput): Promise<SazuAnalysis> {
  let response: Response;
  try {
    response = await fetch("/api/sazu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("네트워크 연결을 확인한 뒤 다시 시도해주세요.");
  }

  let payload: SazuApiResponse;
  try {
    payload = (await response.json()) as SazuApiResponse;
  } catch {
    throw new Error("사주 해석 서버의 응답을 처리하지 못했어요.");
  }

  if (!response.ok || !payload.ok) {
    throw new Error(
      "message" in payload && payload.message
        ? payload.message
        : "사주 분석을 완료하지 못했어요.",
    );
  }

  return payload.data;
}
