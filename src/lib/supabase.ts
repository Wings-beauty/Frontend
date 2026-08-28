import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase 환경변수가 없어 로컬 부스 미리보기 모드로 실행합니다.",
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? "https://local-preview.invalid",
  supabaseAnonKey ?? "local-preview-anon-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: isSupabaseConfigured,
    },
  },
);
