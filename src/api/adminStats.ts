import { supabase } from "../lib/supabase";
import { requireAdmin } from "./auth";

export type AdminStats = {
  totalUsers: number;
  pendingInquiries: number;
  totalDiagnoses: number;
  totalProducts: number;
  publishedNews: number;
  waitlistCount: number;
  totalFeedbacks: number;
  communityPosts: number;
};

type CountRow = { count: string };

export async function fetchAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  const [
    { count: totalUsers },
    { count: pendingInquiries },
    { count: totalDiagnoses },
    { count: totalProducts },
    { count: publishedNews },
    { count: waitlistCount },
    { count: totalFeedbacks },
    { count: communityPosts },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "pending").eq("is_deleted", false),
    supabase.from("diagnosis_results").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("news").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("launch_waitlist").select("*", { count: "exact", head: true }),
    supabase.from("feedbacks").select("*", { count: "exact", head: true }),
    supabase.from("community_posts").select("*", { count: "exact", head: true }).eq("is_deleted", false),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    pendingInquiries: pendingInquiries ?? 0,
    totalDiagnoses: totalDiagnoses ?? 0,
    totalProducts: totalProducts ?? 0,
    publishedNews: publishedNews ?? 0,
    waitlistCount: waitlistCount ?? 0,
    totalFeedbacks: totalFeedbacks ?? 0,
    communityPosts: communityPosts ?? 0,
  };
}
