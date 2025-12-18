"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAuthListener } from "../lib/auth/authListener";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = registerAuthListener(router as any);
    return unsubscribe;
  }, [router]);

  return <>{children}</>;
}
