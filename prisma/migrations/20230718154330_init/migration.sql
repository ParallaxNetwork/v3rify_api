/*
  Warnings:

  - Changed the type of `nfts` on the `MerchantCampaignUsage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "MerchantCampaignUsage" DROP COLUMN "nfts",
ADD COLUMN     "nfts" JSONB NOT NULL;
