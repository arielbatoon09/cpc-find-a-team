"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Divergent, Event, Section, ApplicationStatus } from "@/app/generated/prisma";
import { z } from "zod";

const DIVERGENT_BY_SECTION: Record<Section, Divergent> = {
  [Section.BSIT_1A]: Divergent.DAUNTLESS,
  [Section.BSIT_2C]: Divergent.DAUNTLESS,
  [Section.BSIT_3D]: Divergent.DAUNTLESS,
  [Section.BSIT_4B]: Divergent.DAUNTLESS,

  [Section.BSIT_1B]: Divergent.ERUDITE,
  [Section.BSIT_2A]: Divergent.ERUDITE,
  [Section.BSIT_3C]: Divergent.ERUDITE,
  [Section.BSIT_4D]: Divergent.ERUDITE,

  [Section.BSIT_1C]: Divergent.ABNEGATION,
  [Section.BSIT_2D]: Divergent.ABNEGATION,
  [Section.BSIT_3B]: Divergent.ABNEGATION,
  [Section.BSIT_4A]: Divergent.ABNEGATION,

  [Section.BSIT_1D]: Divergent.AMITY,
  [Section.BSIT_2B]: Divergent.AMITY,
  [Section.BSIT_3A]: Divergent.AMITY,
  [Section.BSIT_4C]: Divergent.AMITY,
};

function getDivergentForSection(section: Section): Divergent {
  return DIVERGENT_BY_SECTION[section];
}

export async function deleteTeam(teamId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const team = await prisma.team.findUnique({
        where: { id: teamId }
    });

    if (!team || team.leaderId !== session.user.id) {
        return { error: "You are not authorized to delete this team" };
    }

    try {
        await prisma.team.delete({
            where: { id: teamId }
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch {
        return { error: "Failed to delete team" };
    }
}

export async function leaveTeam(teamId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const team = await prisma.team.findUnique({
            where: { id: teamId }
        });

        if (team?.leaderId === session.user.id) {
            return { error: "Leaders cannot leave their teams. Delete the team instead." };
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { teamId: null }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch {
        return { error: "Failed to leave team" };
    }
}

export async function applyToTeam(teamId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // Check if user is already in a team
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, teamId: true, section: true }
    });

    if (user?.teamId) {
        return { error: "You are already in a team" };
    }

    // Leaders/representatives who created a team should not join other teams.
    const leadingTeam = await prisma.team.findFirst({
        where: { leaderId: session.user.id },
        select: { id: true }
    });

    if (leadingTeam) {
        return { error: "You already lead a team" };
    }

    if (!user?.section) {
        return { error: "Your section is not set. Please complete onboarding." };
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true, leaderId: true, divergent: true, slots: true }
    });

    if (!team) {
        return { error: "Team not found" };
    }

    if (team.leaderId === user.id) {
        return { error: "You are the leader of this team" };
    }

    const userDivergent = getDivergentForSection(user.section);
    if (userDivergent !== team.divergent) {
        return { error: "You can only apply to teams within your faction" };
    }

    const slotForSection = team.slots.find((s) => s.section === user.section);
    if (!slotForSection) {
        return { error: "This team has no slot for your section" };
    }

    const filledForSection = await prisma.user.count({
        where: {
            teamId: team.id,
            section: user.section,
            id: { not: team.leaderId },
        },
    });

    if (filledForSection >= slotForSection.count) {
        return { error: "No available slots for your section" };
    }

    try {
        await prisma.application.create({
            data: {
                teamId,
                userId: session.user.id,
                status: "PENDING"
            }
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: unknown) {
        const code =
            typeof error === "object" && error !== null && "code" in error
                ? (error as { code?: unknown }).code
                : undefined;

        if (code === "P2002") {
            return { error: "You have already applied to this team" };
        }
        return { error: "Failed to apply to team" };
    }
}

export async function getApplications(teamId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const team = await prisma.team.findUnique({
        where: { id: teamId }
    });

    if (!team || team.leaderId !== session.user.id) {
        return [];
    }

    return await prisma.application.findMany({
        where: { teamId },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { team: { include: { slots: true } } }
    });

    if (!application || application.team.leaderId !== session.user.id) {
        return { error: "Not authorized" };
    }

    try {
        if (status === "ACCEPTED") {
            // Check if user is already in another team
            const targetUser = await prisma.user.findUnique({
                where: { id: application.userId },
                select: { id: true, teamId: true, section: true }
            });

            if (targetUser?.teamId) {
                await prisma.application.delete({ where: { id: applicationId } });
                return { error: "User is already in another team" };
            }

            if (!targetUser?.section) {
                return { error: "Applicant section is not set" };
            }

            const userDivergent = getDivergentForSection(targetUser.section);
            if (userDivergent !== application.team.divergent) {
                return { error: "Applicant is not eligible for this faction" };
            }

            const slotForSection = application.team.slots.find((s) => s.section === targetUser.section);
            if (!slotForSection) {
                return { error: "No slot available for applicant section" };
            }

            const filledForSection = await prisma.user.count({
                where: {
                    teamId: application.teamId,
                    section: targetUser.section,
                    id: { not: application.team.leaderId },
                },
            });

            if (filledForSection >= slotForSection.count) {
                return { error: "No available slot for this section" };
            }

            // Update user's teamId
            await prisma.user.update({
                where: { id: application.userId },
                data: { teamId: application.teamId }
            });

            // Delete application
            await prisma.application.delete({
                where: { id: applicationId }
            });
        } else {
            // REJECTED
            await prisma.application.update({
                where: { id: applicationId },
                data: { status: "REJECTED" }
            });
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch {
        return { error: "Failed to update application" };
    }
}

const TeamSlotSchema = z.object({
  section: z.nativeEnum(Section),
  count: z.number().min(1).max(10),
});

const CreateTeamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().optional(),
  event: z.nativeEnum(Event),
  slots: z.array(TeamSlotSchema).min(1, "At least one slot is required"),
});

export async function createTeam(formData: z.infer<typeof CreateTeamSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Only allow Admin or Representative
  if (session.user.role !== "ADMIN" && session.user.role !== "REPRESENTATIVE") {
    return { error: "Only representatives or admins can create teams" };
  }

  // Representatives/leaders should only have one team, and should not be a member of another team.
  const existingLeaderTeam = await prisma.team.findFirst({
    where: { leaderId: session.user.id },
    select: { id: true },
  });

  if (existingLeaderTeam) {
    return { error: "You already lead a team" };
  }

  // Validate input
  const validated = CreateTeamSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { name, description, event, slots } = validated.data;

  // Get user's divergent faction based on their section
  // This logic is simplified; in production we'd use the lib/divergents map
  // Note: We need the user's section from the DB to be sure
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { section: true, teamId: true }
  });

  if (!user?.section) {
    return { error: "User section not found" };
  }

  if (user.teamId) {
    return { error: "You are already in a team" };
  }

  // Determine divergent (reusing logic from lib/divergents)
  // Instead of re-importing which might cause circular deps or issues in server actions, 
  // we can just check the section mapping.
  const divergent = getDivergentForSection(user.section);

  try {
    const team = await prisma.team.create({
      data: {
        name,
        description,
        event,
        divergent,
        leaderId: session.user.id,
        slots: {
          create: slots.map(slot => ({
            section: slot.section,
            count: slot.count
          }))
        }
      }
    });

    // NOTE: The team leader is stored via `leaderId` and should NOT be added as a member.

    revalidatePath("/dashboard");
    return { success: true, teamId: team.id };
  } catch (error: unknown) {
    console.error("Create Team Error:", error);
    return { error: "Failed to create team. Please try again." };
  }
}

export async function getTeams(userId?: string) {
    const teams = await prisma.team.findMany({
        include: {
            leader: {
                select: {
                    id: true,
                    name: true,
                    section: true
                }
            },
            slots: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    section: true
                }
            },
            _count: {
                select: { members: true }
            },
            applications: userId ? {
                where: { userId }
            } : false
        },
        orderBy: { createdAt: 'desc' }
    });

    // Ensure leader is not counted as a member (also fixes existing DB rows).
    return teams.map((team) => {
        const members = team.members.filter((m) => m.id !== team.leaderId);
        return {
            ...team,
            members,
            _count: {
                ...team._count,
                members: members.length,
            },
        };
    });
}

export async function getMyTeam() {
    const session = await auth();
    if (!session?.user?.id) return { teams: [], applications: [] };

    const teams = await prisma.team.findMany({
        where: {
            OR: [
                { leaderId: session.user.id },
                { members: { some: { id: session.user.id } } }
            ]
        },
        include: {
            leader: true,
            members: {
                select: {
                    id: true,
                    name: true,
                    section: true,
                    role: true
                }
            },
            slots: true,
            applications: {
                include: { user: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const applications = await prisma.application.findMany({
        where: { userId: session.user.id },
        include: {
            team: {
                include: {
                    leader: true,
                    _count: {
                        select: { members: true }
                    },
                    slots: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const normalizedTeams = teams.map((team) => ({
        ...team,
        members: team.members.filter((m) => m.id !== team.leaderId),
    }));

    const normalizedApplications = applications.map((app) => {
        const leaderIsMember = app.team.leader?.teamId === app.team.id;
        const membersCount = leaderIsMember ? Math.max(0, app.team._count.members - 1) : app.team._count.members;

        return {
            ...app,
            team: {
                ...app.team,
                _count: {
                    ...app.team._count,
                    members: membersCount,
                },
            },
        };
    });

    return { teams: normalizedTeams, applications: normalizedApplications };
}
