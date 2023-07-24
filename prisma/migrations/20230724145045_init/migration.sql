-- DropForeignKey
ALTER TABLE "MerchantCampaignRequirement" DROP CONSTRAINT "MerchantCampaignRequirement_galxeCampaignId_fkey";

-- AddForeignKey
ALTER TABLE "MerchantCampaignRequirement" ADD CONSTRAINT "MerchantCampaignRequirement_galxeCampaignId_fkey" FOREIGN KEY ("galxeCampaignId") REFERENCES "GalxeCampaign"("campaignId") ON DELETE CASCADE ON UPDATE CASCADE;
