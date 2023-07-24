/*
  Warnings:

  - Added the required column `chain` to the `GalxeCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GalxeCampaign" ADD COLUMN     "chain" TEXT NOT NULL;
