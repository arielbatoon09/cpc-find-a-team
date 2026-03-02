import { type DefaultSession } from "next-auth";
import { Role, Section } from "@/app/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: Role;
    section: Section | null;
    username: string;
    isOnboarded: boolean;
  }

  interface Session {
    user: {
      role: Role;
      section: Section | null;
      username: string;
      isOnboarded: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    section: Section | null;
    username: string;
    isOnboarded: boolean;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: Role;
    section: Section | null;
    username: string;
    isOnboarded: boolean;
  }
}