import { Suspense } from "react";

import { EditorPage } from "@/components/user/editor-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EditorPage />
    </Suspense>
  );
}
