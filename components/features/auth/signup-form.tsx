"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Users2 } from "lucide-react";
import { signup } from "@/services/auth";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { motion } from "motion/react";

const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        try {
          const result = await signup(value);
          if (result?.error) {
            toast.error(result.error);
          } else {
            toast.success("Account created successfully!");
            router.push("/onboarding");
            router.refresh();
          }
        } catch (error) {
          toast.error("An unexpected error occurred.");
        }
      });
    },
  });

  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
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
        <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Sign up to connect with developers and build amazing projects.
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
          name="username"
          validators={{
            onChange: ({ value }) => {
              const res = signupSchema.shape.username.safeParse(value);
              return res.success ? undefined : res.error.issues[0].message;
            },
          }}
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                placeholder="johndoe"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect="off"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              )}
            </Field>
          )}
        />

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              const res = signupSchema.shape.password.safeParse(value);
              return res.success ? undefined : res.error.issues[0].message;
            },
          }}
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              )}
            </Field>
          )}
        />

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) => {
              const password = fieldApi.form.state.values.password;
              if (value !== password) {
                return "Passwords do not match";
              }
              return undefined;
            },
          }}
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
              )}
            </Field>
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="mt-2 w-full font-semibold"
              disabled={!canSubmit || Boolean(isSubmitting) || isPending}
            >
              {isSubmitting || isPending ? "Creating account..." : "Sign up"}
            </Button>
          )}
        />
      </form>

      <div className="text-center text-sm text-muted-foreground md:text-left">
        Already have an account?{" "}
        <Link
          href="/"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Login
        </Link>
      </div>
    </motion.div>
  );
}
