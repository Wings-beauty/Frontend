import { Suspense } from "react";
import CommunityNewPost from "@/views/CommunityNewPost";

export default function CommunityNewPostPage() {
  return (
    <Suspense>
      <CommunityNewPost />
    </Suspense>
  );
}
