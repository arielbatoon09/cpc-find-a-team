"use client";

import React, { useState } from "react";
import { 
  Users, 
  ChevronRight,
  User,
  PlusCircle,
  Loader2,
  Eye,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FACTIONS } from "@/lib/divergents";
import { Divergent } from "@/app/generated/prisma";
import { applyToTeam } from "@/services/team";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TeamWithLeader {
  id: string;
  name: string;
  description: string | null;
  divergent: Divergent;
  event: string;
  leader: {
    id: string;
    name: string | null;
    section: string | null;
  };
  members: {
    id: string;
    name: string | null;
    section: string | null;
  }[];
  _count: {
    members: number;
  };
  slots: {
      count: number;
  }[];
  applications?: {
      id: string;
      userId: string;
      status: string;
  }[];
}

interface TeamsListProps {
  teams: TeamWithLeader[];
  currentUserId?: string | null;
}

export function TeamsList({ teams, currentUserId }: TeamsListProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState<string | null>(null);

  if (teams.length === 0) {
    return (
        <div className="py-20 text-center border-2 border-dashed rounded-2xl">
            <p className="text-muted-foreground">No teams found for this session yet.</p>
        </div>
    );
  }

  const handleApply = async (teamId: string) => {
    setIsPending(teamId);
    try {
      const result = await applyToTeam(teamId);
      if (result.success) {
        toast.success("Application sent successfully!");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to apply");
    } finally {
      setIsPending(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => {
        const faction = FACTIONS[team.divergent];
        const totalSlots = team.slots.reduce((acc, slot) => acc + slot.count, 0);
        const membersCount = team._count.members;
        const isFull = membersCount >= totalSlots;
        const hasApplied = team.applications?.some(app => app.userId === currentUserId && app.status !== 'REJECTED');
        const isLeader = team.leader.id === currentUserId;
        
        return (
          <div
            key={team.id}
            className="group flex flex-col rounded-xl border bg-card p-6 transition-all hover:bg-accent/5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={cn("h-2 w-10 rounded-full", faction.color.replace('text', 'bg'))} />
              <Badge variant="outline" className={cn(
                "text-[11px] font-semibold border-border bg-muted/30",
                isFull && "text-destructive border-destructive/20"
              )}>
                {membersCount}/{totalSlots} members
              </Badge>
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-base font-bold tracking-tight">{team.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">
                {team.description || "No description provided."}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[11px] text-muted-foreground font-medium">
                <User className="h-3 w-3" />
                <span>{team.leader.name || "Leader"} • {team.leader.section?.replace("_", " ") || "N/A"}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground border-muted-foreground/20">
                  {team.event.replace(/_/g, " ")}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/50"
                    >
                      <Eye className="mr-1.5 h-3 w-3" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl">{team.name}</DialogTitle>
                      <DialogDescription className="text-xs font-bold uppercase tracking-widest text-primary">
                        {team.event.replace(/_/g, " ")}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 pt-4">
                      {team.description && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About Project</h4>
                          <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-4 rounded-xl">
                            {team.description}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Representative / Leader</h4>
                        <div className="flex items-center space-x-3 bg-primary/5 border border-primary/10 p-3 rounded-xl text-sm font-medium">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <UserCircle className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">{team.leader.name}</span>
                            <span className="text-[10px] text-muted-foreground">{team.leader.section?.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Team Members</h4>
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase", isFull ? "text-destructive border-destructive/20" : "text-emerald-500 border-emerald-500/20")}>
                            {team.members.length}/{totalSlots} Filled
                          </Badge>
                        </div>
                        
                        {team.members.length === 0 ? (
                          <div className="py-8 text-center border-2 border-dashed rounded-xl bg-muted/10">
                            <p className="text-xs font-medium text-muted-foreground italic">No members have joined yet.</p>
                          </div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {team.members.map((member) => (
                              <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg border bg-card">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                  {member.name?.[0] || "?"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold">{member.name}</span>
                                  <span className="text-[9px] text-muted-foreground">{member.section?.replace("_", " ")}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {!isFull && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className={cn(
                        "h-8 px-2 text-[11px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5",
                        (hasApplied || isLeader) && "text-muted-foreground hover:bg-transparent cursor-not-allowed opacity-50"
                    )}
                    onClick={() => handleApply(team.id)}
                    disabled={!!isPending || hasApplied || isLeader}
                  >
                    {isPending === team.id ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : (!(hasApplied || isLeader) && <PlusCircle className="mr-1.5 h-3 w-3" />)}
                    {isLeader ? "Your Team" : (hasApplied ? "Applied / Joined" : "Join")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
