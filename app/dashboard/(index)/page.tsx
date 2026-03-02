import React from "react";
import { getTeams } from "@/services/team";
import { auth } from "@/lib/auth";
import { TeamsList } from "@/components/features/dashboard/teams-list";
import { MotionPage } from "@/components/common/motion-page";

export default async function TeamsPage() {
  const session = await auth();
  const teams = await getTeams(session?.user?.id);

  return (
    <MotionPage>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Available Teams</h1>
          <p className="text-sm text-muted-foreground font-medium">Browse and join teams for IT Days</p>
        </div>

        <TeamsList 
          teams={teams as any} 
          currentUserId={session?.user?.id}
        />
      </div>
    </MotionPage>
  );
}