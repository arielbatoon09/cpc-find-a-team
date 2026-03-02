"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  PlusSquare, 
  LayoutDashboard, 
  LogOut,
  ShieldCheck,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { signOut } from "next-auth/react";
import { motion } from "motion/react";

const sidebarLinks = [
  {
    name: "Teams",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "ADMIN", "REPRESENTATIVE"]
  },
  {
    name: "My Team",
    href: "/dashboard/my-team",
    icon: Users,
    roles: ["USER", "ADMIN", "REPRESENTATIVE"]
  },
  {
    name: "Create Team",
    href: "/dashboard/create-team",
    icon: PlusSquare,
    roles: ["ADMIN", "REPRESENTATIVE"]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, username, section } = useUserStore();

  const filteredLinks = sidebarLinks.filter(link => 
    !link.roles || (role && link.roles.includes(role))
  );

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-background/50 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">FindMyTeam</span>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 py-6 px-4">
          <div className="space-y-1">
            {filteredLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <link.icon className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    {link.name}
                  </div>
                  {isActive && (
                    <motion.div layoutId="active-pill" className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Card & Footer */}
        <div className="border-t p-4">
          <div className="mb-4 rounded-xl bg-muted/50 p-4 border border-border/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                  <UserCircle className="h-6 w-6 text-primary" />
                </div>
                {role === "ADMIN" && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                        <ShieldCheck className="h-3 w-3 text-white" />
                    </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold">{username || "User"}</p>
                <p className="truncate text-xs text-muted-foreground uppercase">{section || role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => signOut()}
            className="flex w-full items-center justify-center space-x-2 rounded-xl border border-destructive/20 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
