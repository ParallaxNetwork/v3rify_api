/*
  Warnings:

  - You are about to drop the column `nfts` on the `MerchantCampaignUsage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MerchantCampaignUsage" DROP COLUMN "nfts";

-- CreateTable
CREATE TABLE "NftUsage" (
    "id" TEXT NOT NULL,
    "nftId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,

    CONSTRAINT "NftUsage_pkey" PRIMARY KEY ("id")
);
