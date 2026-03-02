"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Section } from "@/app/generated/prisma";
import { completeOnboarding } from "@/services/onboarding";
import { signOut, useSession } from "next-auth/react";
import { useUserStore } from "@/store/user-store";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Users2 } from "lucide-react";

const onboardingSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  section: z.nativeEnum(Section, {
    message: "Please select your section"
  }),
  isRepresentative: z.boolean().default(false),
  representativeCode: z.string().optional(),
}).refine(data => {
  if (data.isRepresentative && (!data.representativeCode || data.representativeCode.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Representative code is required",
  path: ["representativeCode"]
});

export function OnboardingForm({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { data: session, update: updateSession } = useSession();
  const setUser = useUserStore((state) => state.setUser);

  const form = useForm({
    defaultValues: {
      name: "",
      section: "" as Section,
      isRepresentative: false,
      representativeCode: "",
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        try {
          console.log("Submitting onboarding form...");
          const result = await completeOnboarding(value);
          
          if (result?.error) {
            toast.error(result.error);
            return;
          } 
          
          if (result.success && result.user) {
            console.log("Onboarding success. Updating state and session...");
            
            // 1. Update persistent state immediately
            setUser(result.user);
            
            // 2. Refresh NextAuth session - pass data explicitly to trigger JWT update
            await updateSession({
              ...session?.user,
              isOnboarded: true,
              name: result.user.name,
              section: result.user.section,
              role: result.user.role,
            });
            
            console.log("Session updated successfully.");
            toast.success("Profile updated!");
            
            // 3. Clear navigate to dashboard
            router.push("/dashboard");
            router.refresh();
          }
        } catch (error) {
          console.error("Form submission error:", error);
          toast.error("An unexpected error occurred.");
        }
      });
    },
  });

  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className={cn("grid gap-8", className)} 
    >
      <div className="flex flex-col items-center space-y-2 text-center md:text-left">
        <div className="lg:hidden h-16 w-16 bg-primary/90 text-primary rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/30 shadow-2xl shadow-primary/20">
          <Users2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Tell us about yourself</h1>
        <p className="text-sm text-muted-foreground">
          Help us personalize your experience.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="grid gap-5"
      >
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              const res = onboardingSchema.shape.name.safeParse(value);
              return res.success ? undefined : res.error.issues[0].message;
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="John Doe"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              )}
            </Field>
          )}
        </form.Field>

        <form.Field
          name="section"
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Section</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as Section)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your section" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Section).map((section) => (
                    <SelectItem key={section} value={section}>
                      {section.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              )}
            </Field>
          )}
        </form.Field>

        <form.Field
          name="isRepresentative"
        >
          {(field) => (
            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id={field.name}
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label 
                htmlFor={field.name} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Are you a Representative?
              </label>
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.values.isRepresentative]}>
          {([isRepresentative]) => (
            <AnimatePresence>
              {isRepresentative && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <form.Field
                    name="representativeCode"
                    validators={{
                      onChange: ({ value }) => {
                        if (isRepresentative && !value) return "Code is required";
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Representative Code</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="Enter your representative code"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                        )}
                      </Field>
                    )}
                  </form.Field>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </form.Subscribe>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <div className="mt-2 flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={!canSubmit || Boolean(isSubmitting) || isPending}
              >
                {isSubmitting || isPending ? "Saving..." : "Complete Setup"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Exit to Login
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </motion.div>
  );
}
