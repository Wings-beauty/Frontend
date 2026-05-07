export type InquiryStatus = "pending" | "in_progress" | "answered" | "closed";
export type InquiryCategory = "account" | "diagnosis" | "product" | "bug" | "etc";
export type ProfileRole = "admin" | "user";
export type ToneCode = "spring" | "summer" | "autumn" | "winter";

export const inquiryStatuses: InquiryStatus[] = [
  "pending",
  "in_progress",
  "answered",
  "closed",
];

export const inquiryCategories: InquiryCategory[] = [
  "account",
  "diagnosis",
  "product",
  "bug",
  "etc",
];

export const profileRoles: ProfileRole[] = ["admin", "user"];
export const toneCodes: ToneCode[] = ["spring", "summer", "autumn", "winter"];

export const profileRoleLabels: Record<ProfileRole, string> = {
  admin: "관리자",
  user: "일반 사용자",
};

export const toneCodeLabels: Record<ToneCode, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
};

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  pending: "답변 대기",
  in_progress: "확인 중",
  answered: "답변 완료",
  closed: "종료",
};

export const inquiryCategoryLabels: Record<InquiryCategory, string> = {
  account: "계정/로그인",
  diagnosis: "AI 진단",
  product: "제품 추천/제품 정보",
  bug: "오류 신고",
  etc: "기타",
};

export function getInquiryStatusLabel(status: string | null | undefined) {
  return inquiryStatusLabels[(status as InquiryStatus) ?? "pending"] ?? "답변 대기";
}

export function getInquiryCategoryLabel(category: string | null | undefined) {
  return inquiryCategoryLabels[(category as InquiryCategory) ?? "etc"] ?? "기타";
}

export function isInquiryStatus(value: string): value is InquiryStatus {
  return inquiryStatuses.includes(value as InquiryStatus);
}

export function isInquiryCategory(value: string): value is InquiryCategory {
  return inquiryCategories.includes(value as InquiryCategory);
}
