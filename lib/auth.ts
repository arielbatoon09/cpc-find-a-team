import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role, Section } from "@/app/generated/prisma";
import { getUserByUsername } from "@/data/user.data";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
    newUser: "/signup",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            username: z.string().min(3),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          
          const user = await getUserByUsername(username);

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            section: user.section,
            isOnboarded: user.isOnboarded,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.section = user.section;
        token.isOnboarded = user.isOnboarded;
      }

      if (trigger === "update") {
        console.log("JWT Update triggered for user:", token.id);
        const { getUserById } = await import("@/data/user.data");
        const updatedUser = await getUserById(token.id as string);
        
        if (updatedUser) {
          token.name = updatedUser.name;
          token.role = updatedUser.role;
          token.section = updatedUser.section;
          token.isOnboarded = updatedUser.isOnboarded;
        } else {
          console.error("Failed to find updated user for token refresh!");
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string;
        session.user.section = token.section as Section | null;
        session.user.isOnboarded = token.isOnboarded as boolean;
      }
      return session;
    },
  },
});