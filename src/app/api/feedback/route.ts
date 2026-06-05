import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "../../../types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.REACT_APP_SUPABASE_ANON_KEY;

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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const body = (await request.json()) as {
    diagnosisResultId?: number;
    rating?: number;
    isMatch?: boolean;
    comment?: string;
  };

  if (typeof body.diagnosisResultId !== "number") {
    return NextResponse.json({ error: "diagnosisResultId is required." }, { status: 400 });
  }

  const { error } = await supabase.from("feedbacks").insert({
    user_id: user.id,
    diagnosis_result_id: body.diagnosisResultId,
    rating: typeof body.rating === "number" ? body.rating : null,
    is_match: typeof body.isMatch === "boolean" ? body.isMatch : null,
    comment: body.comment ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
