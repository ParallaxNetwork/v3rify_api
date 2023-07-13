/*
  Warnings:

  - You are about to drop the `MerchantPerk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MerchantPerkBenefit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MerchantPerkCustomCondition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MerchantPerkRequirement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MerchantPerkUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MerchantPerk" DROP CONSTRAINT "MerchantPerk_shopId_fkey";

-- DropForeignKey
ALTER TABLE "MerchantPerkBenefit" DROP CONSTRAINT "MerchantPerkBenefit_perkId_fkey";

-- DropForeignKey
ALTER TABLE "MerchantPerkCustomCondition" DROP CONSTRAINT "MerchantPerkCustomCondition_perkId_fkey";

-- DropForeignKey
ALTER TABLE "MerchantPerkRequirement" DROP CONSTRAINT "MerchantPerkRequirement_nftAddress_fkey";

-- DropForeignKey
ALTER TABLE "MerchantPerkRequirement" DROP CONSTRAINT "MerchantPerkRequirement_perkId_fkey";

-- DropForeignKey
ALTER TABLE "MerchantPerkUsage" DROP CONSTRAINT "MerchantPerkUsage_benefitId_fkey";

-- DropForeignKey
ALTER TABLE "MerchantPerkUsage" DROP CONSTRAINT "MerchantPerkUsage_perkId_fkey";

-- DropForeignKey
ALTER TABLE "MerchantPerkUsage" DROP CONSTRAINT "MerchantPerkUsage_userId_fkey";

-- DropTable
DROP TABLE "MerchantPerk";

-- DropTable
DROP TABLE "MerchantPerkBenefit";

-- DropTable
DROP TABLE "MerchantPerkCustomCondition";

-- DropTable
DROP TABLE "MerchantPerkRequirement";

-- DropTable
DROP TABLE "MerchantPerkUsage";

-- CreateTable
CREATE TABLE "MerchantCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "startPeriod" TIMESTAMP(3) NOT NULL,
    "endPeriod" TIMESTAMP(3) NOT NULL,
    "claimQuota" INTEGER NOT NULL,
    "claimPeriod" INTEGER NOT NULL DEFAULT 1,
    "claimPeriodUnit" TEXT NOT NULL DEFAULT 'day',
    "claimPeriodLimit" INTEGER NOT NULL DEFAULT 1,
    "shopId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCampaignRequirement" (
    "id" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "minimumBalance" INTEGER NOT NULL DEFAULT 1,
    "campaignId" TEXT NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaignRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCampaignCustomCondition" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'balance',
    "properties" JSONB NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaignCustomCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCampaignBenefit" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'discount',
    "value" INTEGER NOT NULL DEFAULT 0,
    "valueUnit" TEXT NOT NULL DEFAULT 'percent',
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaignBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCampaignUsage" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "valueUnit" TEXT NOT NULL DEFAULT 'percent',
    "nftIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paymentTotal" INTEGER NOT NULL DEFAULT 0,
    "paymentUnit" TEXT NOT NULL DEFAULT 'IDR',
    "campaignValue" INTEGER NOT NULL DEFAULT 0,
    "campaignValueUnit" TEXT NOT NULL DEFAULT 'IDR',
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaignUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MerchantCampaign" ADD CONSTRAINT "MerchantCampaign_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "MerchantShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignRequirement" ADD CONSTRAINT "MerchantCampaignRequirement_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MerchantCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignRequirement" ADD CONSTRAINT "MerchantCampaignRequirement_nftAddress_fkey" FOREIGN KEY ("nftAddress") REFERENCES "NftCollection"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignCustomCondition" ADD CONSTRAINT "MerchantCampaignCustomCondition_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MerchantCampaignRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignBenefit" ADD CONSTRAINT "MerchantCampaignBenefit_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MerchantCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignUsage" ADD CONSTRAINT "MerchantCampaignUsage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MerchantCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignUsage" ADD CONSTRAINT "MerchantCampaignUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignUsage" ADD CONSTRAINT "MerchantCampaignUsage_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "MerchantCampaignBenefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
