-- AlterTable
ALTER TABLE "MerchantCampaignUsage" ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
