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

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
