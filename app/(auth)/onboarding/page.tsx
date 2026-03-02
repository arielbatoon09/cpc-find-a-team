import { OnboardingForm } from "@/components/features/auth/onboarding-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  // If already onboarded, don't show this page
  if (session.user.isOnboarded) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}