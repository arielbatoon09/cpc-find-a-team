import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, Section } from "@/app/generated/prisma";

interface UserState {
  id: string | null;
  username: string | null;
  name: string | null;
  role: Role | null;
  section: Section | null;
  isOnboarded: boolean;
  isRepresentative: boolean;
  isAuthenticated: boolean;
  setUser: (user: { id: string; username: string; name: string | null; role: Role; section: Section | null; isOnboarded: boolean }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      username: null,
      name: null,
      role: null,
      section: null,
      isOnboarded: false,
      isRepresentative: false,
      isAuthenticated: false,
      setUser: (user) => set({ 
        ...user, 
        isAuthenticated: true,
        isRepresentative: user.role === Role.REPRESENTATIVE
      }),
      clearUser: () => set({ 
        id: null, 
        username: null, 
        name: null, 
        role: null, 
        section: null, 
        isOnboarded: false, 
        isRepresentative: false,
        isAuthenticated: false 
      }),
    }),
    {
      name: "user-storage",
    }
  )
);
