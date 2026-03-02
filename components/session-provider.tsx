"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { AuthProvider } from "./auth-provider";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextAuthSessionProvider>
  );
}
