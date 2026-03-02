import { Section, Divergent } from "@/app/generated/prisma";

export interface FactionConfig {
  name: Divergent;
  color: string;
  bg: string;
  border: string;
  sections: Section[];
  representative: string;
}

export const FACTIONS: Record<Divergent, FactionConfig> = {
  [Divergent.DAUNTLESS]: {
    name: Divergent.DAUNTLESS,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    sections: [Section.BSIT_1A, Section.BSIT_2C, Section.BSIT_3D, Section.BSIT_4B],
    representative: "Teo"
  },
  [Divergent.ERUDITE]: {
    name: Divergent.ERUDITE,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    sections: [Section.BSIT_1B, Section.BSIT_2A, Section.BSIT_3C, Section.BSIT_4D],
    representative: "Irene"
  },
  [Divergent.ABNEGATION]: {
    name: Divergent.ABNEGATION,
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    sections: [Section.BSIT_1C, Section.BSIT_2D, Section.BSIT_3B, Section.BSIT_4A],
    representative: "Bernie"
  },
  [Divergent.AMITY]: {
    name: Divergent.AMITY,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    sections: [Section.BSIT_1D, Section.BSIT_2B, Section.BSIT_3A, Section.BSIT_4C],
    representative: "Lourenze"
  }
};

export const EVENTS = [
  { id: "TECH_QUIZ_BOWL", name: "Tech Quiz Bowl" },
  { id: "ESPORTS_COD", name: "E-Sports Tournament (COD)" },
  { id: "ESPORTS_CROSSFIRE", name: "E-Sports Tournament (Crossfire Mobile)" },
  { id: "ESPORTS_ML", name: "E-Sports Tournament (Mobile Legends)" },
  { id: "MINI_HACKATHON", name: "Mini Hackathon" },
  { id: "CODE_RELAY", name: "Code Relay" },
  { id: "PC_ASSEMBLY_RACE", name: "PC Assembly Race" }
];

export function getFactionBySection(section: Section): FactionConfig | undefined {
  return Object.values(FACTIONS).find(f => f.sections.includes(section));
}
