import { SignupForm } from "@/components/features/auth/signup-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "CPCIT Days - Sign up",
  description: "Create a new account",
};

export default async function SignupPage() {
  const session = await auth();

  if (session?.user) {
    if (!session.user.isOnboarded) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <>
      <SignupForm />
    </>
  );
}