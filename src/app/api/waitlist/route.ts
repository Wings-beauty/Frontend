import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "../../../types/supabase";

type ProfileToneRow = {
  skin_tone: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createRequestClient(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  return createClient<Database>(supabaseUrl ?? "https://placeholder.supabase.co", supabaseAnonKey ?? "placeholder-anon-key", {
    global: {
      headers: authorization ? { Authorization: authorization } : {},
    },
  });
}

export async function POST(request: Request) {
  const supabase = createRequestClient(request);
  const { source } = (await request.json()) as { source?: string };
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("skin_tone")
        .eq("id", user.id)
        .maybeSingle<ProfileToneRow>()
    : { data: null };

  const { error } = await supabase.from("launch_waitlist").insert({
    email: user?.email ?? null,
    source: source ?? "home",
    tone_code: profile?.skin_tone ?? null,
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
