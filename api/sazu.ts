import {
  SazuApiError,
  SazuClient,
  type CalculateInput,
} from "@sazuapp/client";

const MODULES = [
  "fourPillars",
  "elements",
  "sinStrength",
  "decadeFortune",
  "summary",
];

type SazuRequest = Partial<CalculateInput>;
type ApiRequest = { method?: string; body: unknown };
type ApiResponse = {
  status: (statusCode: number) => { json: (body: unknown) => void };
};

function isCalendarDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidRequest(body: SazuRequest): body is CalculateInput {
  const { birthYear, birthMonth, birthDay, birthHour, birthMinute, isFemale } = body;

  if (
    !Number.isInteger(birthYear) ||
    !Number.isInteger(birthMonth) ||
    !Number.isInteger(birthDay) ||
    (birthYear ?? 0) < 1900 ||
    (birthYear ?? 0) > 2100 ||
    (birthMonth ?? 0) < 1 ||
    (birthMonth ?? 0) > 12 ||
    (birthDay ?? 0) < 1 ||
    (birthDay ?? 0) > 31 ||
    typeof isFemale !== "boolean"
  ) {
    return false;
  }

  if (!isCalendarDate(birthYear!, birthMonth!, birthDay!)) {
    return false;
  }

  if (
    birthHour !== undefined &&
    birthHour !== null &&
    (!Number.isInteger(birthHour) || birthHour < 0 || birthHour > 23)
  ) {
    return false;
  }

  return (
    birthMinute === undefined ||
    (Number.isInteger(birthMinute) && birthMinute >= 0 && birthMinute <= 59)
  );
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "POST 요청만 사용할 수 있어요." });
  }

  if (!process.env.SAZU_API_KEY) {
    console.error("SAZU_API_KEY is not configured");
    return res.status(503).json({
      ok: false,
      message: "사주 분석 기능을 준비 중이에요. 잠시 후 다시 시도해주세요.",
    });
  }

  const input = req.body as SazuRequest;
  if (!isValidRequest(input)) {
    return res.status(400).json({
      ok: false,
      message: "출생일과 시간을 다시 확인해주세요.",
    });
  }

  try {
    const sazu = new SazuClient({ apiKey: process.env.SAZU_API_KEY });
    const result = await sazu.calculate({
      ...input,
      birthCity: input.birthCity?.trim() || "서울",
      detail: "standard",
      locale: "ko",
      modules: MODULES,
    });

    return res.status(200).json({
      ok: true,
      data: {
        modules: result.modules,
        timezone: {
          city: result.timezone.city,
          mode: result.timezone.mode,
        },
      },
    });
  } catch (error) {
    if (error instanceof SazuApiError) {
      if (error.isAuthError) {
        console.error("SAZU authentication error", error.code, error.responseId);
        return res.status(503).json({
          ok: false,
          message: "사주 분석 기능 설정을 확인 중이에요. 잠시 후 다시 시도해주세요.",
        });
      }

      if (error.isRateLimited) {
        return res.status(429).json({
          ok: false,
          message: error.retryAfterSec
            ? `${error.retryAfterSec}초 후 다시 시도해주세요.`
            : "요청이 많아요. 잠시 후 다시 시도해주세요.",
        });
      }

      if (error.isTransient) {
        console.error("SAZU transient error", error.code, error.responseId);
        return res.status(503).json({
          ok: false,
          message: "분석 서비스 연결이 일시적으로 불안정해요. 잠시 후 다시 시도해주세요.",
        });
      }

      console.error("SAZU API error", error.code, error.responseId);
      return res.status(error.status >= 400 && error.status < 600 ? error.status : 500).json({
        ok: false,
        message: "사주 분석을 완료하지 못했어요. 입력 정보를 확인 후 다시 시도해주세요.",
      });
    }

    console.error("Unexpected SAZU error");
    return res.status(500).json({
      ok: false,
      message: "사주 분석을 완료하지 못했어요. 잠시 후 다시 시도해주세요.",
    });
  }
}
