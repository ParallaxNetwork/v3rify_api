/*
  Warnings:

  - Added the required column `rarity` to the `NftCollection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NftCollection" ADD COLUMN     "rarity" JSONB NOT NULL;
