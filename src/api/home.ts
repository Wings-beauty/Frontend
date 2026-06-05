import { supabase } from "../lib/supabase";
import type { PersonalColorSeason } from "../constants/personalColor";

export type HomeDashboard = {
  user: {
    id: string;
    email: string;
  };
  profile: {
    nickname: string;
    profileImageUrl: string | null;
    skinTone: PersonalColorSeason | null;
    role: "admin" | "user";
  };
  latestDiagnosis: {
    id: number;
    season: PersonalColorSeason | null;
    toneLabel: string;
    confidence: number | null;
    createdAt: string | null;
  } | null;
};

export async function getAuthorizationHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export async function fetchHomeDashboard() {
  const response = await fetch("/api/home", {
    headers: await getAuthorizationHeader(),
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("홈 데이터를 불러오지 못했습니다.");
  }

  return (await response.json()) as HomeDashboard;
}

export async function joinLaunchWaitlist(source: string) {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthorizationHeader()),
    },
    body: JSON.stringify({ source }),
  });

  if (!response.ok) {
    throw new Error("알림 신청을 저장하지 못했습니다.");
  }
}
