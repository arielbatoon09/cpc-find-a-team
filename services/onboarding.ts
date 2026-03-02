"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Role, Section } from "@/app/generated/prisma";

const OnboardingSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  section: z.nativeEnum(Section),
  isRepresentative: z.boolean().default(false),
  representativeCode: z.string().optional(),
});

export async function completeOnboarding(values: z.infer<typeof OnboardingSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = OnboardingSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, section, isRepresentative, representativeCode } = validatedFields.data;

  let role: Role = Role.USER;

  if (isRepresentative) {
    if (representativeCode === process.env.REPRESENTATIVE_CODE) {
      role = Role.REPRESENTATIVE;
    } else {
      return { error: "Invalid representative code!" };
    }
  }

  try {
    console.log("Onboarding attempt for user:", session.user.id);
    console.log("Data to update:", { name, section, role });

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        section,
        role,
        isOnboarded: true,
      },
    });

    console.log("Onboarding success!");
    revalidatePath("/dashboard");
    return { 
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name ?? "",
        role: updatedUser.role as Role,
        section: updatedUser.section as Section,
        isOnboarded: updatedUser.isOnboarded,
      }
    };
  } catch (error) {
    console.error("Onboarding error:", error);
    if (error instanceof Error) {
      return { error: `Failed to update profile: ${error.message}` };
    }
    return { error: "Something went wrong!" };
  }
}