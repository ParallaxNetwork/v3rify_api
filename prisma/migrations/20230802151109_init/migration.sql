-- DropForeignKey
ALTER TABLE "MerchantCampaignRequirement" DROP CONSTRAINT "MerchantCampaignRequirement_contractAddress_fkey";

-- DropForeignKey
ALTER TABLE "MerchantCampaignRequirement" DROP CONSTRAINT "MerchantCampaignRequirement_galxeCampaignId_fkey";

-- AddForeignKey
ALTER TABLE "MerchantCampaignRequirement" ADD CONSTRAINT "MerchantCampaignRequirement_contractAddress_fkey" FOREIGN KEY ("contractAddress") REFERENCES "NftCollection"("address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignRequirement" ADD CONSTRAINT "MerchantCampaignRequirement_galxeCampaignId_fkey" FOREIGN KEY ("galxeCampaignId") REFERENCES "GalxeCampaign"("campaignId") ON DELETE SET NULL ON UPDATE CASCADE;
