-- CreateEnum
CREATE TYPE "Section" AS ENUM ('BSIT_1A', 'BSIT_1B', 'BSIT_1C', 'BSIT_1D', 'BSIT_2A', 'BSIT_2B', 'BSIT_2C', 'BSIT_2D', 'BSIT_3A', 'BSIT_3B', 'BSIT_3C', 'BSIT_3D', 'BSIT_4A', 'BSIT_4B', 'BSIT_4C', 'BSIT_4D');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "section" "Section";
