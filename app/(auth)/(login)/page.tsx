import { LoginForm } from "@/components/features/auth/login-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "CPCIT Days - Login",
  description: "Login to your account",
};

export default async function LoginPage() {
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
      <LoginForm />
    </>
  );
}