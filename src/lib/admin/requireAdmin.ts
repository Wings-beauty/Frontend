import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export class AdminApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

/** Validates the browser session and role on every admin API request. */
export async function requireAdminRequest(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization") ?? "";

  if (!url || !anonKey) throw new AdminApiError(500, "Server authentication configuration is incomplete.");
  if (!authorization) throw new AdminApiError(401, "Login required.");

  const supabase = createClient<Database>(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new AdminApiError(401, "Login required.");

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError) throw new AdminApiError(500, "Could not verify administrator access.");
  if (profile?.role !== "admin") throw new AdminApiError(403, "Forbidden.");

  return user;
}
