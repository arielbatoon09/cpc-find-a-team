"use client";

import { useMemo, useState } from "react";
import { 
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
import { Divergent, Section } from "@/app/generated/prisma";
import { applyToTeam } from "@/services/team";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface TeamWithLeader {
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
      section: Section;
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

interface TeamCardProps {
  team: TeamWithLeader;
  currentUserId?: string | null;
  currentUserSection: string | null;
  isPending: string | null;
  onApply: (teamId: string) => Promise<void>;
}

function TeamCard({ 
  team, 
  currentUserId, 
  currentUserSection, 
  isPending, 
  onApply 
}: TeamCardProps) {
  const faction = FACTIONS[team.divergent];
  const totalSlots = team.slots.reduce((acc, slot) => acc + slot.count, 0);
  const membersCount = team._count.members;
  const isFull = membersCount >= totalSlots;
  const isLeader = team.leader.id === currentUserId;
  const isMember = team.members.some(m => m.id === currentUserId);
  const application = team.applications?.find(app => app.userId === currentUserId);
  const isPendingApp = application?.status === 'PENDING';
  const isRejectedApp = application?.status === 'REJECTED';

  const filledBySection = useMemo(() => {
    const acc: Partial<Record<string, number>> = {};
    for (const member of team.members) {
      if (!member.section) continue;
      acc[member.section] = (acc[member.section] ?? 0) + 1;
    }
    return acc;
  }, [team.members]);

  const sectionBadges = team.slots.map((slot) => {
    const filled = filledBySection[String(slot.section)] ?? 0;
    const full = filled >= slot.count;
    return (
      <Badge
        key={String(slot.section)}
        variant="outline"
        className={cn(
          "text-[9px] font-bold uppercase border-border/50 bg-muted/20",
          full && "text-muted-foreground/80",
        )}
        title={`${String(slot.section).replace("_", " ")}: ${filled}/${slot.count}`}
      >
        {String(slot.section).replace("_", " ")} {filled}/{slot.count}
      </Badge>
    );
  });

  const applyDisabledReason = (() => {
    if (!currentUserId) return "You must be logged in";
    if (isLeader) return "You are the leader of this team";
    if (isMember) return "You are already a member";
    if (isPendingApp) return "Your application is pending";
    if (isRejectedApp) return "Your application was rejected";
    if (!currentUserSection) return "Set your section first";
    const isInFaction = faction.sections.includes(currentUserSection as Section);
    if (!isInFaction) return "Not your faction";
    const slotForUser = team.slots.find((s) => s.section === currentUserSection as Section);
    if (!slotForUser) return "No slot for your section";
    const filledForUser = filledBySection[String(currentUserSection)] ?? 0;
    if (filledForUser >= slotForUser.count) return "Your section slot is full";
    if (isFull) return "Team is full";
    if (isPending === team.id) return "Applying...";
    return null;
  })();

  return (
    <div
      className="group flex flex-col rounded-xl border bg-card p-6 transition-all hover:bg-accent/5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={cn("h-2 w-10 rounded-full", faction.color.replace('text', 'bg'))} />
        <Badge variant="outline" className={cn(
          "text-[11px] font-semibold border-border bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          isFull && "text-destructive border-destructive/20 bg-destructive/10 hover:bg-destructive/10"
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

      <div className="mt-5 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Slots by section</p>
        <div className="flex flex-wrap gap-1.5">
          {sectionBadges}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] text-muted-foreground font-medium">
          <User className="h-3 w-3" />
          <span>{team.leader.name || "Leader"} • Representative</span>
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

          <Button 
            size="sm" 
            variant="ghost" 
            className={cn(
                "h-8 px-2 text-[11px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5",
                applyDisabledReason && "text-muted-foreground hover:bg-transparent cursor-not-allowed opacity-50"
            )}
            onClick={() => {
              if (applyDisabledReason) {
                toast.error(applyDisabledReason);
                return;
              }
              void onApply(team.id);
            }}
            disabled={!!applyDisabledReason}
            title={applyDisabledReason ?? "Apply to join"}
          >
            {isPending === team.id ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : (!applyDisabledReason && <PlusCircle className="mr-1.5 h-3 w-3" />)}
            {isLeader ? "Your Team" : (isMember || isPendingApp ? "Applied / Joined" : (isRejectedApp ? "Rejected" : (applyDisabledReason === "Team is full" ? "Full" : "Join")))}
          </Button>
        </div>
      </div>
    </div>
  );
}


export function TeamsList({ teams, currentUserId }: TeamsListProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState<string | null>(null);
  const currentUserSection = useUserStore((s) => s.section);

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
    } catch {
      toast.error("Failed to apply");
    } finally {
      setIsPending(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          currentUserId={currentUserId}
          currentUserSection={currentUserSection}
          isPending={isPending}
          onApply={handleApply}
        />
      ))}
    </div>
  );
}
