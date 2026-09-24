export type PopupCategory = "skincare" | "makeup" | "hair" | "fragrance";
// 화장품을 고를 때 가장 중요하게 보는 기준. 예전에는 "고민"(피부 진정/보습 등) 기준이었다가
// 클라이언트 요청으로 "선택 기준" 중심 질문으로 바뀌었다.
export type PopupCriteria = "ingredient" | "price" | "brand" | "review";
export type PopupTexture = "light" | "rich" | "matte";
export type PopupBudget = "under_15000" | "15000_25000" | "over_25000";
export type PopupInfoNeed =
  | "ingredients_list"
  | "reviews"
  | "price_compare"
  | "try_in_person";
export type PopupTimeSlot = "10-12" | "12-14" | "14-16";

export type PopupAnswers = {
  category: PopupCategory;
  criteria: PopupCriteria;
  texture: PopupTexture;
  budget: PopupBudget;
  infoNeed: PopupInfoNeed;
};

export type PopupProduct = {
  key: string;
  brand: string;
  name: string;
  shade: string;
  category: PopupCategory;
  criteria: PopupCriteria[];
  popupPrice: number;
  originalPrice: number;
  tags: string[];
  reason: string;
  priority: number;
  imageUrl: string | null;
  colorHex: string;
};

export const POPUP_EVENT = {
  key: "2026-10-01-incheon",
  title: "WINGS POP-UP",
  dateLabel: "2026. 10. 01 (목)",
  dateShortLabel: "10월 1일",
  timeLabel: "10:00 - 16:00",
  place: "인천대학교 학산도서관 플리마켓",
  address: "인천대학교 학산도서관 앞 광장",
  mapUrl: "https://map.naver.com/p/search/인천대학교%20학산도서관",
  benefits: ["직접 체험", "팝업 한정 할인", "선착순 기프트"],
} as const;

export const POPUP_BRANDS = [
  "꽃빵",
  "클라시보",
  "미니어",
  "이뎃",
  "더아본",
  "테라케어",
  "지솔브",
  "희요",
] as const;

// 공식 홈페이지·카카오채널에서 확인한 실제 브랜드 로고만 넣었다.
// 나머지 브랜드는 공식 출처를 찾지 못해 워드마크 텍스트로 대체한다.
export const POPUP_BRAND_LOGOS: Partial<Record<(typeof POPUP_BRANDS)[number], string>> = {
  꽃빵: "/brand-logos/kkotppang.webp",
  클라시보: "/brand-logos/klarcebo.webp",
  테라케어: "/brand-logos/terracare.webp",
};

export const POPUP_FEATURES = [
  { title: "AI가 찾은", body: "나만의 취향" },
  { title: "직접 만나는", body: "브랜드 제품" },
  { title: "팝업 한정", body: "혜택 & 이벤트" },
] as const;

export type PopupAboutTile =
  | { label: string; caption: string; colorHex: string; imageUrl?: undefined }
  | { label: string; caption: string; imageUrl: string; colorHex?: undefined };

export const POPUP_ABOUT_TILES: PopupAboutTile[] = [
  { label: "Beauty", caption: "find a better you", colorHex: "#efa48b" },
  {
    label: "올인원바 삼형제",
    caption: "더아본 올인원바",
    imageUrl: "/popup-products/theavon-allinone-bar-trio.webp",
  },
];

export type PopupQuestion<T extends string> = {
  id: "category" | "criteria" | "texture" | "budget" | "infoNeed";
  title: string;
  options: { value: T; label: string; hint: string; colorHex: string }[];
};

export const POPUP_QUESTIONS: [
  PopupQuestion<PopupCategory>,
  PopupQuestion<PopupCriteria>,
  PopupQuestion<PopupTexture>,
  PopupQuestion<PopupBudget>,
  PopupQuestion<PopupInfoNeed>,
] = [
  {
    id: "category",
    title: "어떤 카테고리에\n관심이 있으신가요?",
    options: [
      { value: "skincare", label: "스킨케어", hint: "클렌저·크림·미스트", colorHex: "#c9a27e" },
      { value: "makeup", label: "메이크업", hint: "쿠션·크림 치크", colorHex: "#d85f66" },
      { value: "hair", label: "헤어케어", hint: "샴푸·트리트먼트", colorHex: "#8a716b" },
      { value: "fragrance", label: "향수", hint: "퍼퓸", colorHex: "#b5776e" },
    ],
  },
  {
    id: "criteria",
    title: "화장품을 고를 때\n가장 중요한 기준은?",
    options: [
      { value: "ingredient", label: "성분과 효능", hint: "꼼꼼히 따져봐요", colorHex: "#6bb594" },
      { value: "price", label: "합리적인 가격", hint: "가성비가 중요해요", colorHex: "#f7e4ac" },
      { value: "brand", label: "브랜드 신뢰도", hint: "믿을 수 있는 곳으로", colorHex: "#c9a27e" },
      { value: "review", label: "리뷰와 평판", hint: "후기를 참고해요", colorHex: "#d84f8b" },
    ],
  },
  {
    id: "texture",
    title: "선호하는\n사용감이 있나요?",
    options: [
      { value: "light", label: "가볍고 산뜻한", hint: "산뜻한 마무리", colorHex: "#c9dfe0" },
      { value: "rich", label: "촉촉하고 밀착되는", hint: "밀도 있는 보습", colorHex: "#f0a58f" },
      { value: "matte", label: "보송하고 매트한", hint: "산뜻한 세팅", colorHex: "#b5776e" },
    ],
  },
  {
    id: "budget",
    title: "예산은 어느 정도로\n생각하고 계신가요?",
    options: [
      { value: "under_15000", label: "1.5만원 미만", hint: "부담 없이 시작", colorHex: "#f7e4ac" },
      { value: "15000_25000", label: "1.5만원 ~ 2.5만원", hint: "가장 많이 선택해요", colorHex: "#f0c9a3" },
      { value: "over_25000", label: "2.5만원 이상", hint: "제대로 투자할래요", colorHex: "#c9a27e" },
    ],
  },
  {
    id: "infoNeed",
    title: "처음 보는 제품을 살 때\n가장 필요한 정보는?",
    options: [
      { value: "ingredients_list", label: "전 성분표", hint: "성분을 확인하고 싶어요", colorHex: "#6bb594" },
      { value: "reviews", label: "실사용 후기", hint: "써본 사람 이야기가 궁금해요", colorHex: "#d84f8b" },
      { value: "price_compare", label: "가격 비교", hint: "정상가와 비교해볼래요", colorHex: "#f7e4ac" },
      { value: "try_in_person", label: "직접 테스트", hint: "발라보고 결정할래요", colorHex: "#e8c4a0" },
    ],
  },
];

export const POPUP_CRITERIA_PHRASES: Record<PopupCriteria, string> = {
  ingredient: "성분과 효능을 꼼꼼히 보셔서",
  price: "합리적인 가격을 중요하게 보셔서",
  brand: "믿을 수 있는 브랜드를 찾으셔서",
  review: "리뷰와 평판을 참고하고 싶으셔서",
};

export const POPUP_BUDGET_PHRASES: Record<PopupBudget, string> = {
  under_15000: "1.5만원 미만 예산에 맞고",
  "15000_25000": "1.5만~2.5만원 예산에 맞고",
  over_25000: "2.5만원 이상 예산에 맞고",
};

export const POPUP_TEXTURE_PHRASES: Record<PopupTexture, string> = {
  light: "가볍고 산뜻한 사용감을 좋아하셔서",
  rich: "촉촉하고 밀착되는 사용감을 좋아하셔서",
  matte: "보송하고 매트한 마무리를 좋아하셔서",
};

// 결과 화면의 "행사에서 체험하는 방법" 문구. 5번 질문(구매 시 필요한 정보) 답변에 맞춰 보여준다.
export const POPUP_INFO_NEED_TIPS: Record<PopupInfoNeed, string> = {
  ingredients_list: "현장에서 전 성분표를 자세히 확인해보세요.",
  reviews: "현장 스태프에게 실사용 후기를 직접 물어보세요.",
  price_compare: "정상가와 팝업 판매가를 비교하며 골라보세요.",
  try_in_person: "부스에서 직접 발라보고 사용감을 확인해보세요.",
};

export const POPUP_TIME_SLOTS: { value: PopupTimeSlot; label: string }[] = [
  { value: "10-12", label: "10:00 - 12:00" },
  { value: "12-14", label: "12:00 - 14:00" },
  { value: "14-16", label: "14:00 - 16:00" },
];

export const POPUP_PURCHASE_REASONS = [
  "추천 결과가 마음에 들어서",
  "팝업 특가가 좋아서",
  "직접 발라보고 결정했어요",
  "향·사용감이 좋아서",
  "브랜드를 좋아해서",
  "선물하려고",
  "현장 직원 추천",
  "기프트·이벤트 혜택",
] as const;

const IMG = "/popup-products";

// 2026-10-01 인천대 학산도서관 플리마켓 실제 참여 브랜드 제품입니다. 판매가·정가는 클라이언트가 준 정가표 기준입니다.
export const POPUP_PRODUCTS: PopupProduct[] = [
  {
    key: "clasivo-new-heart-cica-cushion",
    brand: "클라시보",
    name: "뉴 하트 시카 쿠션 팩트",
    shade: "",
    category: "makeup",
    criteria: ["ingredient", "brand"],
    popupPrice: 29900,
    originalPrice: 42000,
    tags: ["시카 진정", "커버력", "쿠션 팩트"],
    reason: "시카 성분이 예민한 피부를 진정시키면서도 커버력이 좋아 하루 종일 화사해요.",
    priority: 1,
    imageUrl: `${IMG}/clasivo-new-heart-cica-cushion.webp`,
    colorHex: "#e8c4a0",
  },
  {
    key: "minier-tone-gyeol-cream",
    brand: "미니어",
    name: "톤 결 크림",
    shade: "",
    category: "skincare",
    criteria: ["ingredient"],
    popupPrice: 26900,
    originalPrice: 32000,
    tags: ["톤 보정", "결 정돈", "데일리 크림"],
    reason: "칙칙한 피부 톤을 밝고 화사하게 정돈해주는 데일리 톤크림이에요.",
    priority: 1,
    imageUrl: `${IMG}/minier-tone-gyeol-cream.webp`,
    colorHex: "#f0d9c0",
  },
  {
    key: "edet-cooltone-cream-cheek-babysheer",
    brand: "이뎃",
    name: "쿨톤 크림 치크",
    shade: "01 베이비 쉬어",
    category: "makeup",
    criteria: ["price"],
    popupPrice: 14900,
    originalPrice: 26000,
    tags: ["쿨톤 추천", "자연스러운 혈색", "크림 텍스처"],
    reason: "투명한 베이비 핑크가 쿨톤 피부에 은은한 생기를 더해줘요.",
    priority: 2,
    imageUrl: `${IMG}/edet-cooltone-cream-cheek-babysheer.webp`,
    colorHex: "#f2b8c6",
  },
  {
    key: "edet-cooltone-cream-cheek-softpeach",
    brand: "이뎃",
    name: "쿨톤 크림 치크",
    shade: "02 소프트 피치",
    category: "makeup",
    criteria: ["price"],
    popupPrice: 14900,
    originalPrice: 26000,
    tags: ["쿨톤 추천", "부드러운 발색", "크림 텍스처"],
    reason: "부드러운 피치 컬러가 자연스럽게 스며들어 편안한 혈색을 만들어줘요.",
    priority: 3,
    imageUrl: `${IMG}/edet-cooltone-cream-cheek-softpeach.webp`,
    colorHex: "#f0a99a",
  },
  {
    key: "edet-cooltone-cream-cheek-calmnude",
    brand: "이뎃",
    name: "쿨톤 크림 치크",
    shade: "03 캄 누드",
    category: "makeup",
    criteria: ["price"],
    popupPrice: 14900,
    originalPrice: 26000,
    tags: ["쿨톤 추천", "차분한 누드", "크림 텍스처"],
    reason: "차분한 누드 톤이라 진하지 않게 톤만 정돈하고 싶을 때 좋아요.",
    priority: 4,
    imageUrl: `${IMG}/edet-cooltone-cream-cheek-calmnude.webp`,
    colorHex: "#d9a08f",
  },
  {
    key: "theavon-cica-velvet-grain-cleanser",
    brand: "더아본",
    name: "시카 벨벳 그레인 팩클렌저",
    shade: "",
    category: "skincare",
    criteria: ["ingredient", "price"],
    popupPrice: 9900,
    originalPrice: 27000,
    tags: ["시카 진정", "약산성", "저자극 세안"],
    reason: "미세한 그레인이 자극 없이 각질과 노폐물을 부드럽게 정리해줘요.",
    priority: 2,
    imageUrl: `${IMG}/theavon-cica-velvet-grain-cleanser.webp`,
    colorHex: "#bfe0d5",
  },
  {
    key: "theavon-cica-velvet-clay-cleanser",
    brand: "더아본",
    name: "시카 벨벳 클레이 팩클렌저",
    shade: "",
    category: "skincare",
    criteria: ["ingredient", "price"],
    popupPrice: 9900,
    originalPrice: 27000,
    tags: ["시카 진정", "클레이", "모공 케어"],
    reason: "클레이 성분이 피지와 노폐물을 흡착하면서도 당김 없이 산뜻해요.",
    priority: 3,
    imageUrl: `${IMG}/theavon-cica-velvet-clay-cleanser.webp`,
    colorHex: "#a8c9b8",
  },
  {
    key: "theavon-allinone-bar-blacklavender",
    brand: "더아본",
    name: "올인원바 시카",
    shade: "블랙라벤더",
    category: "skincare",
    criteria: ["ingredient", "price"],
    popupPrice: 9900,
    originalPrice: 20000,
    tags: ["시카 진정", "올인원 바", "은은한 라벤더 향"],
    reason: "은은한 라벤더 향과 함께 얼굴부터 바디까지 하나로 진정 케어해요.",
    priority: 4,
    imageUrl: `${IMG}/theavon-allinone-bar-blacklavender.webp`,
    colorHex: "#8f7fa8",
  },
  {
    key: "theavon-allinone-bar-teatree",
    brand: "더아본",
    name: "올인원바 시카",
    shade: "티트리",
    category: "skincare",
    criteria: ["ingredient", "price"],
    popupPrice: 9900,
    originalPrice: 20000,
    tags: ["시카 진정", "올인원 바", "트러블 케어"],
    reason: "티트리가 트러블이 신경 쓰이는 날 산뜻하게 진정시켜줘요.",
    priority: 5,
    imageUrl: `${IMG}/theavon-allinone-bar-teatree.webp`,
    colorHex: "#7fa88f",
  },
  {
    key: "theavon-allinone-bar-softrich",
    brand: "더아본",
    name: "올인원바 시카",
    shade: "소프트리치",
    category: "skincare",
    criteria: ["ingredient", "price"],
    popupPrice: 9900,
    originalPrice: 20000,
    tags: ["시카 진정", "올인원 바", "촉촉한 마무리"],
    reason: "세정 후에도 당김 없이 촉촉하게 마무리되는 순한 올인원바예요.",
    priority: 6,
    imageUrl: `${IMG}/theavon-allinone-bar-softrich.webp`,
    colorHex: "#e0c4a8",
  },
  {
    key: "theavon-azelis-ether-edt",
    brand: "더아본",
    name: "아젤리스 에테르 오 드 뚜왈렛",
    shade: "",
    category: "fragrance",
    criteria: ["brand", "review"],
    popupPrice: 34900,
    originalPrice: 69000,
    tags: ["은은한 잔향", "데일리 향수", "선물 추천"],
    reason: "과하지 않게 은은히 남는 잔향이라 데일리로 쓰기 좋아요.",
    priority: 1,
    imageUrl: `${IMG}/theavon-azelis-ether-edt.webp`,
    colorHex: "#d9c79a",
  },
  {
    key: "teracare-hairstraw-scalp-shampoo",
    brand: "테라케어",
    name: "헤어스트로 스칼프 케어 샴푸",
    shade: "200ml",
    category: "hair",
    criteria: ["ingredient", "price"],
    popupPrice: 10000,
    originalPrice: 29000,
    tags: ["두피 진정", "저자극", "데일리 샴푸"],
    reason: "예민해진 두피를 진정시키면서 부드럽게 세정해주는 데일리 샴푸예요.",
    priority: 1,
    imageUrl: `${IMG}/teracare-hairstraw-scalp-shampoo.webp`,
    colorHex: "#a8c4a0",
  },
  {
    key: "teracare-hairstraw-scalp-treatment",
    brand: "테라케어",
    name: "헤어스트로 스칼프 케어 트리트먼트",
    shade: "200ml",
    category: "hair",
    criteria: ["ingredient", "price"],
    popupPrice: 10000,
    originalPrice: 29000,
    tags: ["두피 진정", "모발 영양", "촉촉한 마무리"],
    reason: "손상된 모발 끝까지 영양을 채워 촉촉하고 부드럽게 마무리돼요.",
    priority: 2,
    imageUrl: `${IMG}/teracare-hairstraw-scalp-treatment.webp`,
    colorHex: "#94b596",
  },
  {
    key: "zisolve-vibrating-eye-cream",
    brand: "지솔브",
    name: "진동 아이크림",
    shade: "",
    category: "skincare",
    criteria: ["ingredient", "review"],
    popupPrice: 25000,
    originalPrice: 39000,
    tags: ["진동 마사지", "눈가 탄력", "산뜻한 마무리"],
    reason: "진동 어플리케이터로 눈가에 영양을 꼼꼼히 채워 탄력 있게 관리해요.",
    priority: 7,
    imageUrl: `${IMG}/zisolve-vibrating-eye-cream.webp`,
    colorHex: "#d9c8a0",
  },
  {
    key: "zisolve-pdrn-mist",
    brand: "지솔브",
    name: "PDRN 미스트",
    shade: "",
    category: "skincare",
    criteria: ["ingredient", "review"],
    popupPrice: 15000,
    originalPrice: 35000,
    tags: ["PDRN", "수분 충전", "산뜻한 미스트"],
    reason: "PDRN 성분이 지친 피부에 수분과 영양을 빠르게 채워줘요.",
    priority: 1,
    imageUrl: `${IMG}/zisolve-pdrn-mist.webp`,
    colorHex: "#c9dfe0",
  },
  {
    key: "heeyo-3sec-hair-booster",
    brand: "희요",
    name: "3초 헤어부스터",
    shade: "150ml",
    category: "hair",
    criteria: ["review", "price"],
    popupPrice: 29900,
    originalPrice: 52000,
    tags: ["3초 스타일링", "향 좋은 헤어", "손상모 케어"],
    reason: "3초만 뿌려도 손상모가 정돈되고 은은한 향까지 남아요.",
    priority: 3,
    imageUrl: `${IMG}/heeyo-3sec-hair-booster.webp`,
    colorHex: "#c9a8b5",
  },
];

export function getPopupProduct(key: string) {
  return POPUP_PRODUCTS.find((product) => product.key === key);
}
