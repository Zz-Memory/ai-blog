import { Suspense } from "react";

import { VisitorCenterPage } from "@/components/user/visitor-center-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VisitorCenterPage />
    </Suspense>
  );
}
