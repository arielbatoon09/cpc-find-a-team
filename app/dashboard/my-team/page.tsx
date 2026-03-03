import React from "react";
import { getMyTeam } from "@/services/team";
import { MyTeamContent } from "@/components/features/dashboard/my-team-content";
import { MotionPage } from "@/components/common/motion-page";
import type { ComponentProps } from "react";

import { auth } from "@/lib/auth";

export default async function MyTeamPage() {
  const session = await auth();
  const data = await getMyTeam();
  const typedData = data as unknown as ComponentProps<typeof MyTeamContent>["data"];

  const totalPendingApps = data.teams.reduce((acc, team) => {
    // Only count applications for teams the user leads
    if (team.leaderId !== session?.user?.id) return acc;
    return acc + (team.applications?.filter(a => a.status === "PENDING").length || 0);
  }, 0);

  return (
    <MotionPage>
      <div className="max-w-4xl mx-auto py-10 space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">My Teams</h1>
              {totalPendingApps > 0 && (
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full text-white bg-destructive px-2 text-[12px] font-bold text-destructive-foreground animate-in zoom-in duration-500 shadow-sm">
                  {totalPendingApps}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Manage your team participation and leadership</p>
          </div>
        </div>

        <MyTeamContent data={typedData} />
      </div>
    </MotionPage>
  );
}