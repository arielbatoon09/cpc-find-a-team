"use client";

import React from "react";
import { 
  Bell, 
  Search, 
  Menu,
  ChevronDown,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/user-store";

export function DashboardHeader() {
  const { name, role } = useUserStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/60 px-4 backdrop-blur-xl lg:px-8">
      {/* Search Bar - Hidden on Mobile */}
      <div className="hidden flex-1 items-center lg:flex">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search for teams..." 
            className="w-full bg-muted/50 pl-10 border-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Mobile Menu Icon (Placeholder for functionality) */}
      <div className="lg:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-muted/30">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-primary" />
        </Button>

        <div className="h-4 w-[1px] bg-border" />

        <div className="flex items-center space-x-3">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-semibold leading-none">{name || "User"}</p>
            <p className="mt-1 text-xs text-muted-foreground capitalize">{role?.toLowerCase()}</p>
          </div>
          <Button variant="ghost" className="h-10 w-10 rounded-full p-0 ring-1 ring-border/50">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}
