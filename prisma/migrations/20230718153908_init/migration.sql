/*
  Warnings:

  - You are about to drop the column `benefitId` on the `MerchantCampaignUsage` table. All the data in the column will be lost.
  - You are about to drop the column `campaignValue` on the `MerchantCampaignUsage` table. All the data in the column will be lost.
  - You are about to drop the column `campaignValueUnit` on the `MerchantCampaignUsage` table. All the data in the column will be lost.
  - You are about to drop the column `paymentTotal` on the `MerchantCampaignUsage` table. All the data in the column will be lost.
  - You are about to drop the column `paymentUnit` on the `MerchantCampaignUsage` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `MerchantCampaignUsage` table. All the data in the column will be lost.
  - You are about to drop the column `valueUnit` on the `MerchantCampaignUsage` table. All the data in the column will be lost.
  - The `nftIds` column on the `MerchantCampaignUsage` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "MerchantCampaignUsage" DROP CONSTRAINT "MerchantCampaignUsage_benefitId_fkey";

-- AlterTable
ALTER TABLE "MerchantCampaignUsage" DROP COLUMN "benefitId",
DROP COLUMN "campaignValue",
DROP COLUMN "campaignValueUnit",
DROP COLUMN "paymentTotal",
DROP COLUMN "paymentUnit",
DROP COLUMN "value",
DROP COLUMN "valueUnit",
DROP COLUMN "nftIds",
ADD COLUMN     "nftIds" JSONB[] DEFAULT ARRAY[]::JSONB[];
