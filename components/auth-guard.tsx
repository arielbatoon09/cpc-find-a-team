"use client";

import { useUserStore } from "@/store/user-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const { isOnboarded } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    const isAuthenticated = status === "authenticated";
    const userIsOnboarded = isOnboarded || session?.user?.isOnboarded;
    const isProtectedRoute = pathname.startsWith("/dashboard");
    const isAuthRoute = pathname === "/" || pathname === "/signup";
    const isOnboardingRoute = pathname === "/onboarding";

    if (!isAuthenticated) {
      // Only redirect to login if they are trying to access a dashboard route
      if (isProtectedRoute || isOnboardingRoute) {
        router.push("/");
      }
    } else {
      // Authenticated users
      if (!userIsOnboarded) {
        // Only force onboarding if they are trying to access the dashboard
        if (isProtectedRoute) {
          router.push("/onboarding");
        }
      } else {
        // If onboarded, prevent staying on auth or onboarding pages
        if (isAuthRoute || isOnboardingRoute) {
          router.push("/dashboard");
        }
      }
    }
  }, [status, isOnboarded, session, pathname, router]);

  // Optionally show a loading state while checking auth
  if (status === "loading") {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
