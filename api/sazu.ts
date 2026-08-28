import { GoogleGenAI } from "@google/genai";
import { calculateFourPillars } from "manseryeok";

type ApiRequest = { method?: string; body: unknown };
type ApiResponse = { status: (statusCode: number) => { json: (body: unknown) => void } };
type SazuRequest = { birthYear?: number; birthMonth?: number; birthDay?: number; birthHour?: number | null; birthMinute?: number; isFemale?: boolean; isLunar?: boolean; isLeapMonth?: boolean; birthCity?: string };

const KOREAN_ELEMENTS = ["목", "화", "토", "금", "수"] as const;
const ELEMENT_KEYS = ["wood", "fire", "earth", "metal", "water"] as const;
const CITY_LONGITUDES: Record<string, number> = { 서울: 126.978, 부산: 129.075, 대구: 128.601, 인천: 126.705, 광주: 126.852, 대전: 127.385, 울산: 129.312, 제주: 126.531 };

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function errorStatus(error: unknown) { return isRecord(error) && typeof error.status === "number" ? error.status : undefined; }
function isCalendarDate(year: number, month: number, day: number) { const date = new Date(Date.UTC(year, month - 1, day)); return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day; }
function isValidRequest(body: unknown): body is Required<Pick<SazuRequest, "birthYear" | "birthMonth" | "birthDay" | "isFemale">> & SazuRequest {
  if (!isRecord(body)) return false;
  const { birthYear, birthMonth, birthDay, birthHour, birthMinute, isFemale } = body as SazuRequest;
  return Number.isInteger(birthYear) && Number.isInteger(birthMonth) && Number.isInteger(birthDay) && typeof isFemale === "boolean" && (birthYear ?? 0) >= 1900 && (birthYear ?? 0) <= 2100 && (birthMonth ?? 0) >= 1 && (birthMonth ?? 0) <= 12 && isCalendarDate(birthYear!, birthMonth!, birthDay!) && (birthHour === undefined || birthHour === null || (Number.isInteger(birthHour) && birthHour >= 0 && birthHour <= 23)) && (birthMinute === undefined || (Number.isInteger(birthMinute) && birthMinute >= 0 && birthMinute <= 59));
}

function makeElementSummary(elements: readonly string[]) {
  const counts = Object.fromEntries(KOREAN_ELEMENTS.map((element) => [element, 0])) as Record<(typeof KOREAN_ELEMENTS)[number], number>;
  elements.forEach((element) => { if (element in counts) counts[element as keyof typeof counts] += 1; });
  const dominant = KOREAN_ELEMENTS.reduce((best, element) => counts[element] > counts[best] ? element : best, KOREAN_ELEMENTS[0]);
  const lacking = KOREAN_ELEMENTS.reduce((best, element) => counts[element] < counts[best] ? element : best, KOREAN_ELEMENTS[0]);
  return { dominant, lacking, modules: Object.fromEntries(ELEMENT_KEYS.map((key, index) => { const element = KOREAN_ELEMENTS[index]; return [key, { name: element, total: { percentage: Math.round((counts[element] / 8) * 100) } }]; })) };
}

async function interpretWithModel(chart: Record<string, unknown>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  const modelClient = new GoogleGenAI({ apiKey });
  const response = await modelClient.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: `당신은 한국 사주 명리 정보를 쉽게 설명하는 안내자입니다. 아래 계산 결과만 근거로, 단정적 예언이나 의료·재정 조언 없이 한국어로 해석하세요. 존댓말을 사용하고, 아래 5개 제목을 그대로 사용해 각각 짧은 문단으로 작성하세요.\n\n1) 대운\n2) 성격 기질분석\n3) 올해 운세\n4) 연애운\n5) 직업운\n\n올해 운세는 현재 연도(${new Date().getFullYear()}년)를 기준으로 설명하세요. 제공된 계산 결과에 근거가 부족한 경우에는 가능성을 조심스럽게 표현하고, 구체적인 사건·금액·건강 결과를 단정하지 마세요. 마지막에는 오락·참고용 해석이며 중요한 결정은 본인의 판단이 우선이라는 문장을 덧붙이세요.\n\n계산 결과:\n${JSON.stringify(chart)}`,
  });
  return response.text?.trim() || "해석을 생성하지 못했어요.";
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "POST 요청만 사용할 수 있어요." });
  if (!isValidRequest(req.body)) return res.status(400).json({ ok: false, message: "출생일과 시간을 다시 확인해주세요." });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ ok: false, message: "사주 해석 기능을 준비 중이에요. 잠시 후 다시 시도해주세요." });

  const input = req.body;
  const city = input.birthCity?.trim() || "서울";
  const hourUnknown = input.birthHour === null || input.birthHour === undefined;
  try {
    const result = calculateFourPillars({ year: input.birthYear, month: input.birthMonth, day: input.birthDay, hour: hourUnknown ? 12 : input.birthHour ?? 12, minute: hourUnknown ? 0 : input.birthMinute ?? 0, isLunar: input.isLunar ?? false, isLeapMonth: input.isLunar ? input.isLeapMonth ?? false : false, gender: input.isFemale ? "female" : "male", trueSolarTime: { longitude: CITY_LONGITUDES[city] ?? 127.5 } });
    const elementSummary = makeElementSummary([result.yearElement.stem, result.yearElement.branch, result.monthElement.stem, result.monthElement.branch, result.dayElement.stem, result.dayElement.branch, result.hourElement.stem, result.hourElement.branch]);
    const chart = { fourPillars: result.toObject(), dayMaster: result.day.heavenlyStem, elements: elementSummary, tenGods: result.tenGods, voidBranches: result.voidBranches, luckPillars: result.luckPillars, hourUnknown };
    const interpretation = await interpretWithModel(chart);
    return res.status(200).json({ ok: true, data: {
      modules: {
        fourPillars: Object.fromEntries(Object.entries(result.toObject()).map(([key, full]) => [key, { full }])),
        elements: elementSummary.modules,
        sinStrength: { level: "사주 해석 참고", score: "-" },
        decadeFortune: result.luckPillars ? { direction: result.luckPillars.forward ? "순행" : "역행", startAge: result.luckPillars.startAge, list: result.luckPillars.pillars } : undefined,
        summary: { dayMaster: { char: result.day.heavenlyStem }, elementBalance: { dominant: elementSummary.dominant, lacking: elementSummary.lacking } },
      },
      interpretation,
      timezone: { city, mode: "trueSolar" },
    } });
  } catch (error) {
    console.error("Sazu calculation or interpretation failed", error instanceof Error ? error.message : "unknown");
    if (errorStatus(error) === 429 || errorStatus(error) === 503) {
      return res.status(503).json({ ok: false, message: "사주 해석 요청이 많아요. 잠시 후 다시 시도해주세요." });
    }
    return res.status(500).json({ ok: false, message: "사주 분석을 완료하지 못했어요. 잠시 후 다시 시도해주세요." });
  }
}
