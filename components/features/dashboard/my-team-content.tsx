"use client";

import React, { useState } from "react";
import { 
  Trash2,
  UserPlus,
  UserCircle,
  X,
  Check,
  Loader2,
  ArrowLeft,
  Clock,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/user-store";
import { cn } from "@/lib/utils";
import { 
  deleteTeam, 
  leaveTeam, 
  updateApplicationStatus 
} from "@/services/team";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MotionPage } from "@/components/common/motion-page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamApplication {
  id: string;
  status: string;
  user: {
    name: string | null;
    section: string | null;
  };
  team: {
    name: string;
    event: string;
    leader: { name: string | null };
    _count: { members: number };
  };
}

interface TeamMember {
  id: string;
  name: string | null;
}

interface TeamSlot {
  count: number;
}

interface TeamData {
  id: string;
  name: string;
  event: string;
  leaderId: string | null;
  createdAt: Date;
  slots: TeamSlot[];
  applications: TeamApplication[];
  members: TeamMember[];
}

interface MyTeamContentProps {
  data: {
    teams: TeamData[];
    applications: TeamApplication[];
  } | null;
}

export function MyTeamContent({ data }: MyTeamContentProps) {
  const router = useRouter();
  const { id: currentUserId } = useUserStore();
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  
  if (!data || (data.teams.length === 0 && data.applications.length === 0)) {
    return (
        <div className="space-y-10">
            <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Team Leadership & Participation</h2>
                <div className="py-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-muted/5">
                    <p className="text-xs font-medium text-muted-foreground">You have no active teams or sent applications.</p>
                    <Button variant="link" size="sm" asChild className="mt-2 text-primary">
                        <a href="/dashboard">Explore Teams</a>
                    </Button>
                </div>
            </section>
        </div>
    );
  }

  const { teams, applications } = data;

  const handleDeleteTeam = async (teamId: string) => {
    setIsPending(true);
    try {
      const result = await deleteTeam(teamId);
      if (result.success) {
        toast.success("Team deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete team");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    setIsPending(true);
    try {
      const result = await leaveTeam(teamId);
      if (result.success) {
        toast.success("Left team successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to leave team");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleStatusUpdate = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const result = await updateApplicationStatus(appId, status);
      if (result.success) {
        toast.success(`Application ${status === 'ACCEPTED' ? 'accepted' : 'rejected'}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update application");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const activeTeam = teams.find(t => t.id === activeTeamId);

  if (activeTeamId && activeTeam) {
    return (
      <MotionPage>
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveTeamId(null)}
              className="text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
            <div className="text-right">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Manage Applications</h2>
                <p className="text-[10px] text-primary font-bold">{activeTeam.name}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {activeTeam.applications?.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/5">
                <p className="text-sm text-muted-foreground font-medium">No pending applications found.</p>
              </div>
            ) : (
                activeTeam.applications?.filter((a) => a.status === 'PENDING').length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/5">
                        <p className="text-sm text-muted-foreground font-medium">All applications have been processed.</p>
                    </div>
                ) : (
                    activeTeam.applications?.filter((a) => a.status === 'PENDING').map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {app.user.name?.[0] || "?"}
                            </div>
                            <div>
                            <p className="text-sm font-bold">{app.user.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{app.user.section?.replace("_", " ")}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 rounded-md text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
                            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                            >
                            <X className="h-4 w-4" />
                            </Button>
                            <Button 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')}
                            >
                            <Check className="h-4 w-4" />
                            </Button>
                        </div>
                        </div>
                    ))
                )
            )}
          </div>
        </section>
      </MotionPage>
    );
  }

  // Separate led teams and joined teams
  const ledTeams = teams.filter(t => t.leaderId === currentUserId);
  const joinedTeams = teams.filter(t => t.leaderId !== currentUserId);

  return (
    <div className="space-y-16">
      {/* Led Teams Section */}
      {ledTeams.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Teams You Lead</h2>
          <div className="grid gap-6">
            {ledTeams.map(team => {
                const totalSlots = team.slots.reduce((acc: number, slot) => acc + slot.count, 0);
                const pendingApps = team.applications?.filter((a) => a.status === 'PENDING').length || 0;
                
                return (
                    <div key={team.id} className="rounded-xl border bg-card p-6 shadow-none flex flex-col space-y-6 group transition-colors hover:border-primary/20">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight">{team.name}</h3>
                                    <p className="text-sm text-muted-foreground">{team.event.replace(/_/g, " ")}</p>
                                </div>
                                
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-muted-foreground italic uppercase tracking-wider">Members</p>
                                    <div className="flex flex-wrap gap-2">
                                        {team.members.map((member) => (
                                            <div key={member.id} className="flex items-center space-x-2 text-[11px] font-medium bg-muted/40 px-3 py-1.5 rounded-md text-muted-foreground border">
                                                <UserCircle className="h-3 w-3" />
                                                <span>{member.name}</span>
                                                {member.id === team.leaderId && (
                                                    <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-primary/20 h-4 px-1 leading-none uppercase">Lead</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:items-end gap-2">
                                <Badge variant="outline" className="rounded-lg px-3 py-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[11px]">
                                    {team.members.length}/{totalSlots} Members
                                </Badge>
                                <div className="text-[10px] text-muted-foreground flex items-center space-x-1">
                                    <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t flex items-center justify-between mt-auto">
                            <div className="flex items-center space-x-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 text-[11px] font-bold uppercase tracking-wider rounded-md"
                                    onClick={() => setActiveTeamId(team.id)}
                                >
                                    <UserPlus className="mr-1.5 h-3 w-3" />
                                    Manage Applications
                                    {pendingApps > 0 && (
                                        <span className="ml-2 bg-primary text-primary-foreground h-4 w-4 rounded-full text-[9px] flex items-center justify-center animate-pulse font-black">
                                            {pendingApps}
                                        </span>
                                    )}
                                </Button>
                            </div>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-md"
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete &quot;{team.name}&quot;?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the team and remove all members.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={() => handleDeleteTeam(team.id)}
                                            className="!bg-destructive hover:bg-destructive/90"
                                        >
                                            Delete Team
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                );
            })}
          </div>
        </section>
      )}

      {/* Joined Teams Section */}
      {joinedTeams.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Teams You Joined</h2>
          <div className="grid gap-6">
            {joinedTeams.map(team => {
                const totalSlots = team.slots.reduce((acc: number, slot) => acc + slot.count, 0);
                
                return (
                    <div key={team.id} className="rounded-xl border bg-card p-6 shadow-none flex flex-col space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight">{team.name}</h3>
                                    <p className="text-sm text-muted-foreground">{team.event.replace(/_/g, " ")}</p>
                                </div>
                                
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-muted-foreground italic uppercase tracking-wider">Members</p>
                                    <div className="flex flex-wrap gap-2">
                                        {team.members.map((member) => (
                                            <div key={member.id} className="flex items-center space-x-2 text-[11px] font-medium bg-muted/40 px-3 py-1.5 rounded-md text-muted-foreground border">
                                                <UserCircle className="h-3 w-3" />
                                                <span>{member.name}</span>
                                                {member.id === team.leaderId && (
                                                    <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-primary/20 h-4 px-1 leading-none uppercase">Lead</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:items-end gap-2">
                                <Badge variant="outline" className="rounded-lg px-3 py-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[11px]">
                                    {team.members.length}/{totalSlots} Members
                                </Badge>
                                <div className="text-[10px] text-muted-foreground flex items-center space-x-1">
                                    <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t flex items-center justify-between">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 text-[11px] font-bold uppercase tracking-wider rounded-md text-destructive hover:bg-destructive/5 hover:text-destructive"
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : null}
                                        Leave Team
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Leave &quot;{team.name}&quot;?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to leave this team? You will need to apply again if you want to rejoin.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={() => handleLeaveTeam(team.id)}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            Leave Team
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                );
            })}
          </div>
        </section>
      )}

      {/* Applied Teams Section */}
      {applications.length > 0 && (
          <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Applications</h2>
              <div className="grid gap-4">
                  {applications.map(app => {
                      const statusColors = {
                          PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                          ACCEPTED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                          REJECTED: "bg-destructive/10 text-destructive border-destructive/20"
                      };
                      
                      const StatusIcon = app.status === 'PENDING' ? Clock : (app.status === 'ACCEPTED' ? ShieldCheck : ShieldAlert);

                      return (
                          <div key={app.id} className="p-5 border rounded-xl bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                      <h3 className="text-sm font-bold">{app.team.name}</h3>
                                      <Badge variant="outline" className={cn("text-[9px] h-5 px-1.5 font-bold uppercase", statusColors[app.status as keyof typeof statusColors])}>
                                          <StatusIcon className="h-3 w-3 mr-1" />
                                          {app.status}
                                      </Badge>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground italic">{app.team.event.replace(/_/g, " ")}</p>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Team Lead</p>
                                      <p className="text-xs font-medium">{app.team.leader.name}</p>
                                  </div>
                                  <div className="h-8 w-px bg-border/50 hidden sm:block" />
                                  <div className="text-right">
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Waitlist</p>
                                      <p className="text-xs font-medium">{app.team._count.members} Members</p>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </section>
      )}
    </div>
  );
}
