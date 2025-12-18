"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAuthListener } from "@/app/lib/auth/authListener";

export default function AuthGate() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = registerAuthListener(router);
    return () => unsubscribe?.();
  }, [router]);

  return null;
}
