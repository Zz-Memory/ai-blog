"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AuthModal } from "@/components/auth/auth-modal";

type AuthMode = "login" | "register";

type HomeAuthModalProps = {
  isOpen: boolean;
  initialMode: AuthMode;
};

export function HomeAuthModal({ isOpen, initialMode }: HomeAuthModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isOpen) return;
    const auth = searchParams.get("auth");
    if (auth !== initialMode) return;
  }, [isOpen, initialMode, searchParams]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return <AuthModal isOpen={isOpen} initialMode={initialMode} onClose={handleClose} />;
}
