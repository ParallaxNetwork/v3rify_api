/*
  Warnings:

  - You are about to drop the column `nftIds` on the `MerchantCampaignUsage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MerchantCampaignUsage" DROP COLUMN "nftIds",
ADD COLUMN     "nfts" JSONB[] DEFAULT ARRAY[]::JSONB[];
