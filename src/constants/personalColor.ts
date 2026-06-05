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
    toneCode: "spring",
    toneLabel: "봄 웜",
    title: "봄 웜톤에 가까워요",
    description: "맑고 따뜻한 코랄, 피치, 아이보리 계열이 얼굴에 생기를 더해주는 타입이에요.",
    detailTitle: "화사하고 생기 있는 밝은 웜톤",
    detailDescription:
      "봄 웜톤은 전체적으로 밝고 따뜻한 색을 사용할 때 피부가 더 맑고 생기 있어 보여요. 코랄, 피치, 살구, 라이트 오렌지처럼 투명하고 산뜻한 컬러가 잘 어울리며, 너무 어둡거나 탁한 색보다는 가볍고 깨끗한 색을 선택하는 것이 좋아요. 메이크업은 진한 음영보다 맑은 혈색을 살리는 방향이 잘 맞습니다.",
    imageUrl: "/spring.png",
    accentClassName: "bg-tone-spring",
    accentSoftClassName: "bg-tone-spring/28",
    bestColors: ["#ffb7a1", "#ffd6aa", "#fff0bd", "#f5b6a6", "#ffc7bc"],
  },

  summer: {
    seasonLabel: "여름",
    toneCode: "summer",
    toneLabel: "여름 쿨",
    title: "여름 쿨톤에 가까워요",
    description: "부드러운 핑크, 로즈, 라벤더처럼 차분하고 은은한 쿨 컬러가 잘 어울려요.",
    detailTitle: "맑고 부드러운 분위기의 쿨톤",
    detailDescription:
      "여름 쿨톤은 강한 대비감보다는 부드럽고 차분한 색을 사용할 때 얼굴 분위기가 자연스럽게 정돈돼 보여요. 라벤더, 로즈 핑크, 모브, 소프트 블루처럼 회기가 살짝 섞인 컬러가 잘 어울리며, 너무 쨍하거나 노란기가 강한 색은 피부가 뜨거나 피곤해 보일 수 있어요. 메이크업은 맑고 투명한 느낌, 은은한 혈색을 중심으로 연출하는 것이 좋습니다.",
    imageUrl: "/summer.png",
    accentClassName: "bg-tone-summer",
    accentSoftClassName: "bg-tone-summer/35",
    bestColors: ["#d7e8fa", "#d6c3f2", "#db7d89", "#c3a0b2", "#8d99ad"],
  },

  autumn: {
    seasonLabel: "가을",
    toneCode: "autumn",
    toneLabel: "가을 웜",
    title: "가을 웜톤에 가까워요",
    description: "카멜, 테라코타, 브라운 로즈처럼 깊고 차분한 웜 컬러가 분위기를 살려줘요.",
    detailTitle: "차분하고 깊이 있는 분위기의 웜톤",
    detailDescription:
      "가을 웜톤은 따뜻하면서도 깊이감 있는 색을 사용할 때 얼굴의 분위기가 더 안정적이고 고급스럽게 보여요. 테라코타, 브릭, 카멜, 브라운, 말린 장미 계열처럼 채도가 살짝 낮고 무게감 있는 컬러가 잘 어울립니다. 너무 형광기 있거나 차가운 핑크 계열은 피부와 따로 떠 보일 수 있어요. 메이크업은 부드러운 음영, 따뜻한 혈색, 자연스러운 깊이감을 살리는 방향이 잘 맞습니다.",
    imageUrl: "/autumn.png",
    accentClassName: "bg-tone-autumn",
    accentSoftClassName: "bg-tone-autumn/32",
    bestColors: ["#d9a98f", "#c98b68", "#a86f54", "#8f5a3f", "#dfc1a5"],
  },

  winter: {
    seasonLabel: "겨울",
    toneCode: "winter",
    toneLabel: "겨울 쿨",
    title: "겨울 쿨톤에 가까워요",
    description: "선명한 핑크, 체리 레드, 버건디, 아이시 라벤더처럼 또렷한 쿨 컬러가 잘 어울려요.",
    detailTitle: "깨끗하고 또렷한 인상의 선명한 쿨톤",
    detailDescription:
      "겨울 쿨톤은 선명하고 대비감 있는 색을 사용할 때 이목구비가 더 또렷하게 살아나요. 체리 레드, 푸시아 핑크, 버건디, 플럼, 아이시 라벤더처럼 차갑고 깨끗한 컬러가 잘 어울리며, 애매하게 탁하거나 노란기가 강한 색은 인상을 흐려 보이게 만들 수 있어요. 메이크업은 맑은 피부 표현에 포인트 컬러를 또렷하게 주는 방식이 잘 맞습니다.",
    imageUrl: "/winter.png",
    accentClassName: "bg-tone-winter",
    accentSoftClassName: "bg-tone-winter/36",
    bestColors: ["#e2d8ff", "#c5b4ff", "#9f8eed", "#d84f8b", "#492f62"],
  },
};

export function getPersonalColorSeasonFromValue(value: string | null | undefined): PersonalColorSeason {
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

