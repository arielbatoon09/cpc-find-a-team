import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getPendingApplicationsCount } from "@/services/team";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // 1. If not authenticated, go to login
  if (!session) {
    redirect("/");
  }

  // 2. If authenticated but not onboarded, force onboarding
  if (!session.user.isOnboarded) {
    redirect("/onboarding");
  }

  const pendingApplicationsCount = await getPendingApplicationsCount();

  // 3. User is ready for the dashboard
  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar 
        user={{
          role: session.user.role ?? null,
          name: session.user.name ?? null,
          username: session.user.username ?? null,
          section: session.user.section ?? null
        }} 
        pendingApplicationsCount={pendingApplicationsCount}
      />
      <main className="container mx-auto px-4 py-8 lg:px-8 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}