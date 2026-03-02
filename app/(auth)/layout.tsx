import { Users2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Banner */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-zinc-950 text-white p-12 relative overflow-hidden">
        <div className="z-10 text-center max-w-md flex flex-col items-center">
          <div className="h-16 w-16 bg-primary/90 text-primary rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/30 shadow-2xl shadow-primary/20">
            <Users2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Find My Team
          </h1>
          <p className="text-zinc-400 text-lg">
            Connect with like-minded individuals, join activities, and have fun together!
          </p>
          <p className="mt-7 text-zinc-400">
            Created with ❤️ by <span className="text-white font-semibold"><Link target="_blank" className="underline-offset-4 hover:underline text-zinc-200" href="https://www.arielbatoon.com/">Ariel Batoon</Link></span>
          </p>
        </div>
        
        {/* Decorative background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Right Form Container */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </main>
  );
}