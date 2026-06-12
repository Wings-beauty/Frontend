import { Suspense } from "react";
import Community from "@/views/Community";

export default function CommunityPage() {
  return (
    <Suspense>
      <Community />
    </Suspense>
  );
}
