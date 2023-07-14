/*
  Warnings:

  - You are about to drop the column `chain` on the `MerchantCampaignRequirement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MerchantCampaignRequirement" DROP COLUMN "chain",
ADD COLUMN     "network" TEXT NOT NULL DEFAULT 'ethereum';
