import React from "react";
import { getMyTeam } from "@/services/team";
import { MyTeamContent } from "@/components/features/dashboard/my-team-content";
import { MotionPage } from "@/components/common/motion-page";
import type { ComponentProps } from "react";

export default async function MyTeamPage() {
  const data = await getMyTeam();
  const typedData = data as unknown as ComponentProps<typeof MyTeamContent>["data"];

  return (
    <MotionPage>
      <div className="max-w-4xl mx-auto py-10 space-y-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Teams</h1>
          <p className="text-sm text-muted-foreground font-medium">Manage your team participation and leadership</p>
        </div>

        <MyTeamContent data={typedData} />
      </div>
    </MotionPage>
  );
}