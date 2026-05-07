export type PersonalColorSeason = "spring" | "summer" | "autumn" | "winter";

export const personalColorResults: Record<
  PersonalColorSeason,
  {
    seasonLabel: string;
    toneCode: string;
    toneLabel: string;
    title: string;
    description: string;
    detailTitle: string;
    detailDescription: string;
    imageUrl: string;
    accentClassName: string;
    accentSoftClassName: string;
    bestColors: string[];
  }
> = {
  spring: {
    seasonLabel: "봄",
    toneCode: "spring_mock",
    toneLabel: "봄 웜 라이트",
    title: "봄 웜 라이트에 가까워요",
    description: "맑은 코랄, 피치, 아이보리 컬러가 잘 어울려요.",
    detailTitle: "화사하고 생기 있는 웜톤",
    detailDescription: "밝고 따뜻한 색이 얼굴에 생기를 더해줍니다.",
    imageUrl: "/spring.png",
    accentClassName: "bg-tone-spring",
    accentSoftClassName: "bg-tone-spring/28",
    bestColors: ["#ffb7a1", "#ffd6aa", "#fff0bd", "#f5b6a6", "#ffc7bc"],
  },
  summer: {
    seasonLabel: "여름",
    toneCode: "summer_mock",
    toneLabel: "여름 쿨 뮤트",
    title: "여름 쿨 뮤트에 가까워요",
    description: "차분한 핑크, 로즈, 라벤더 컬러가 잘 어울려요.",
    detailTitle: "맑고 부드러운 쿨톤",
    detailDescription: "회기가 도는 부드러운 컬러들이 당신의 우아함을 더욱 돋보이게 합니다.",
    imageUrl: "/summer.png",
    accentClassName: "bg-tone-summer",
    accentSoftClassName: "bg-tone-summer/35",
    bestColors: ["#d7e8fa", "#d6c3f2", "#db7d89", "#c3a0b2", "#8d99ad"],
  },
  autumn: {
    seasonLabel: "가을",
    toneCode: "autumn_mock",
    toneLabel: "가을 웜 뮤트",
    title: "가을 웜 뮤트에 가까워요",
    description: "카멜, 테라코타, 브라운 로즈 컬러가 잘 어울려요.",
    detailTitle: "차분하고 깊이 있는 웜톤",
    detailDescription: "부드러운 흙빛 컬러가 분위기를 안정적으로 잡아줍니다.",
    imageUrl: "/autumn.png",
    accentClassName: "bg-tone-autumn",
    accentSoftClassName: "bg-tone-autumn/32",
    bestColors: ["#d9a98f", "#c98b68", "#a86f54", "#8f5a3f", "#dfc1a5"],
  },
  winter: {
    seasonLabel: "겨울",
    toneCode: "winter_mock",
    toneLabel: "겨울 쿨 브라이트",
    title: "겨울 쿨 브라이트에 가까워요",
    description: "선명한 핑크, 버건디, 아이시 라벤더 컬러가 잘 어울려요.",
    detailTitle: "깨끗하고 또렷한 쿨톤",
    detailDescription: "대비감 있는 컬러가 이목구비를 선명하게 보여줍니다.",
    imageUrl: "/winter.png",
    accentClassName: "bg-tone-winter",
    accentSoftClassName: "bg-tone-winter/36",
    bestColors: ["#e2d8ff", "#c5b4ff", "#9f8eed", "#d84f8b", "#492f62"],
  },
};

export function getPersonalColorSeasonFromValue(
  value: string | null | undefined,
): PersonalColorSeason {
  const storedResult = value ?? "";
  const normalizedResult = storedResult.toLowerCase();

  if (normalizedResult.includes("spring") || storedResult.includes("봄")) {
    return "spring";
  }

  if (normalizedResult.includes("autumn") || storedResult.includes("가을")) {
    return "autumn";
  }

  if (normalizedResult.includes("winter") || storedResult.includes("겨울")) {
    return "winter";
  }

  return "summer";
}

export function getStoredPersonalColorSeason(): PersonalColorSeason {
  const storedResult =
    sessionStorage.getItem("wings_personal_color_season") ??
    sessionStorage.getItem("wings_personal_color_result") ??
    "";

  return getPersonalColorSeasonFromValue(storedResult);
}
