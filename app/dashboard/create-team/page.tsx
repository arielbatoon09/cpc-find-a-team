"use client";

import React, { useState } from "react";
import {
  Trash2,
  PlusCircle,
  AlertCircle,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserStore } from "@/store/user-store";
import { Section, Event } from "@/app/generated/prisma";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { EVENTS, getFactionBySection } from "@/lib/divergents";
import { cn } from "@/lib/utils";
import { createTeam } from "@/services/team";
import { useRouter } from "next/navigation";
import { MotionPage } from "@/components/common/motion-page";

interface Slot {
  section: Section;
  count: number;
}

export default function CreateTeamPage() {
  const router = useRouter();
  const { role, section: userSection } = useUserStore();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isPending, setIsPending] = useState(false);

  const userFaction = userSection ? getFactionBySection(userSection as Section) : null;

  const handleAddSlot = () => {
    if (slots.length >= 10 || !userFaction) return;
    setSlots([...slots, { section: userFaction.sections[0], count: 1 }]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index: number, field: keyof Slot, value: Slot[keyof Slot]) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const event = formData.get("event") as Event;

    if (!name || !event || slots.length === 0) {
      toast.error("Please fill in all required fields and add at least one slot.");
      return;
    }

    setIsPending(true);
    try {
      const result = await createTeam({
        name,
        description,
        event,
        slots
      });

      if (result.success) {
        toast.success("Team created successfully!");
        router.push("/dashboard/my-team");
      } else {
        toast.error(result.error || "Failed to create team");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  if (role !== "ADMIN" && role !== "REPRESENTATIVE") {
    return (
      <MotionPage>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center space-y-4 max-w-sm border p-8 rounded-xl bg-card">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Access Restricted</h2>
            <p className="text-sm text-muted-foreground">
              Only Team Representatives or Administrators are authorized to create new teams.
            </p>
            <Button variant="outline" size="sm" asChild className="rounded-md">
              <a href="/dashboard">Back to Home</a>
            </Button>
          </div>
        </div>
      </MotionPage>
    );
  }

  return (
    <MotionPage>
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Create a Team</h1>
          <p className="text-sm text-muted-foreground font-medium">Define your team structure for IT Days</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-xl border bg-card p-8 shadow-none">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Team Details</label>
                    <Input
                      name="name"
                      required
                      placeholder="Team Name (e.g. Code Warriors)"
                      className="rounded-md border-border bg-muted/20 focus:ring-1 transition-all h-10"
                    />
                    <Select name="event" required>
                      <SelectTrigger className="rounded-md border-border bg-muted/20 h-10 w-full">
                        <SelectValue placeholder="Select Event" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENTS.map(event => (
                          <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Description</label>
                    <textarea
                      name="description"
                      className="flex min-h-[100px] w-full rounded-md border border-border bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
                      placeholder="Tell us about your team project..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1 pt-4 border-t">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Slots</label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddSlot}
                        className="text-[10px] uppercase tracking-widest font-bold text-primary hover:bg-primary/5"
                      >
                        <PlusCircle className="mr-1.5 h-3 w-3" />
                        Add Slot
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {slots.length === 0 && (
                        <p className="text-[11px] text-muted-foreground italic text-center py-2">No slots added yet.</p>
                      )}
                      {slots.map((slot, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-muted/10 p-2 rounded-md border border-border/50">
                          <Select
                            value={slot.section}
                            onValueChange={(v) => handleSlotChange(index, "section", v as Section)}
                          >
                            <SelectTrigger className="h-8 border-none bg-transparent text-xs font-semibold shadow-none focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {userFaction?.sections.map(s => (
                                <SelectItem key={s} value={s} className="text-xs">{s.replace("_", " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            value={slot.count}
                            min={1}
                            max={5}
                            onChange={(e) => handleSlotChange(index, "count", parseInt(e.target.value))}
                            className="w-16 h-8 border-none bg-transparent text-center font-bold text-xs shadow-none focus-visible:ring-0"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSlot(index)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t font-semibold">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-md h-10 shadow-none font-bold"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isPending ? "Creating..." : "Create Team"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-2 space-y-4">
            {userFaction && (
              <div className={cn(
                "p-6 rounded-xl border flex flex-col space-y-2 shadow-none",
                userFaction.bg,
                userFaction.border
              )}>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Faction Context</span>
                <p className={cn("text-lg font-black italic", userFaction.color)}>{userFaction.name}</p>
                <div className="pt-2 border-t border-current/10">
                  <p className="text-[10px] font-medium opacity-80 uppercase tracking-tight">Instructor: {userFaction.representative}</p>
                </div>
              </div>
            )}

            <div className="rounded-xl border bg-muted/10 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Guidelines</h3>
              <ul className="space-y-3 text-[11px] font-medium text-muted-foreground">
                <li className="flex items-start">
                  <ArrowRight className="mr-2 h-3 w-3 shrink-0 mt-0.5 text-primary" />
                  <span>Faction members can only join teams within their specific Divergent pool.</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="mr-2 h-3 w-3 shrink-0 mt-0.5 text-primary" />
                  <span>Specify exact slots for sections to help students find available spots.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MotionPage>
  );
}