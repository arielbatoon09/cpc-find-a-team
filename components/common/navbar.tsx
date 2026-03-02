"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Plus, 
  LayoutDashboard, 
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  HelpCircle,
  Menu,
  Users2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";

import { Role, Section } from "@/app/generated/prisma";

const navLinks = [
  {
    name: "Teams",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "ADMIN", "REPRESENTATIVE"] as Role[]
  },
  {
    name: "Create",
    href: "/dashboard/create-team",
    icon: Plus,
    roles: ["ADMIN", "REPRESENTATIVE"] as Role[]
  },
  {
    name: "My Teams",
    href: "/dashboard/my-team",
    icon: Users,
    roles: ["USER", "ADMIN", "REPRESENTATIVE"] as Role[]
  },
  {
    name: "FAQ",
    href: "/dashboard/faq",
    icon: HelpCircle,
    roles: ["USER", "ADMIN", "REPRESENTATIVE"] as Role[]
  }
];

interface NavbarProps {
  user?: {
    role: Role | null;
    name: string | null;
    username: string | null;
    section: Section | null;
  };
}

export function Navbar({ user: initialUser }: NavbarProps) {
  const pathname = usePathname();
  const storeUser = useUserStore();
  
  // Use passed prop if available (for SSR), otherwise fallback to client store
  const name = initialUser?.name ?? storeUser.name;
  const role = initialUser?.role ?? storeUser.role;
  const username = initialUser?.username ?? storeUser.username;
  const section = initialUser?.section ?? storeUser.section;

  const filteredLinks = navLinks.filter(link => 
    !link.roles || (role && link.roles.includes(role))
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary/90 text-primary rounded-lg flex items-center justify-center">
              <Users2 className="h-4 w-4 text-white" />
            </div>
            <div className="text-lg font-bold tracking-tight">CPC IT Days</div>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="hidden absolute left-1/2 -translate-x-1/2 items-center space-x-6 md:flex">
          {filteredLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-1",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: User Menu + Mobile Trigger */}
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 flex items-center space-x-2 rounded-md px-2 border hover:bg-muted/50">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {name || username || "Account"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{name || username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{section}</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary w-fit capitalize">
                    {role === "USER" ? "Student" : role?.toLowerCase()}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {role === "ADMIN" && (
                <DropdownMenuItem className="cursor-pointer">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Drawer Trigger */}
          <div className="md:hidden">
            <Drawer direction="right">
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 border">
                  <Menu className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-full">
                <DrawerHeader className="border-b">
                  <DrawerTitle className="text-left">Navigation</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col p-4 space-y-4 text-left">
                  {filteredLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center space-x-3 p-2.5 rounded-lg transition-colors",
                          isActive 
                            ? "bg-primary/10 text-primary font-semibold" 
                            : "hover:bg-muted text-muted-foreground"
                        )}
                        onClick={() => {
                          // Simple way to trigger close - usually Drawer items should close on click
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </nav>
  );
}
