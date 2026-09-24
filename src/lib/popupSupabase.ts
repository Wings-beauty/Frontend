import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase 환경변수가 없습니다. REACT_APP_SUPABASE_URL과 REACT_APP_SUPABASE_ANON_KEY를 확인해주세요.",
  );
}

// 익명 방문자 전용 client. 기존 회원 인증 세션과 저장소를 공유하지 않는다.
export const popupSupabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storageKey: "wings-popup-auth",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);
