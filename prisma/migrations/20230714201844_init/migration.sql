/*
  Warnings:

  - You are about to drop the column `minimumBalance` on the `MerchantCampaignRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `nftAddress` on the `MerchantCampaignRequirement` table. All the data in the column will be lost.
  - Added the required column `contractAddress` to the `MerchantCampaignRequirement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MerchantCampaignRequirement" DROP CONSTRAINT "MerchantCampaignRequirement_nftAddress_fkey";

-- AlterTable
ALTER TABLE "MerchantCampaignRequirement" DROP COLUMN "minimumBalance",
DROP COLUMN "nftAddress",
ADD COLUMN     "contractAddress" TEXT NOT NULL,
ADD COLUMN     "minimumHold" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "MerchantCampaignRequirement" ADD CONSTRAINT "MerchantCampaignRequirement_contractAddress_fkey" FOREIGN KEY ("contractAddress") REFERENCES "NftCollection"("address") ON DELETE CASCADE ON UPDATE CASCADE;
