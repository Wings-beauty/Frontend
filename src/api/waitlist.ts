import { getStoredPersonalColorSeason } from "../constants/personalColor";
import { supabase } from "../lib/supabase";

export async function addToLaunchWaitlist(source: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("launch_waitlist").insert({
    email: user?.email ?? null,
    source,
    tone_code: getStoredPersonalColorSeason(),
  });

  if (error) {
    if (error.code === "23505") {
      return;
    }

    throw new Error(error.message || "알림 신청 저장에 실패했습니다.");
  }
}
