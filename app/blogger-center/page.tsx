import { Suspense } from "react";

import { BloggerCenterPage } from "@/components/user/blogger-center-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BloggerCenterPage />
    </Suspense>
  );
}
