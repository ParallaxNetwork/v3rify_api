-- AlterTable
ALTER TABLE "MerchantCampaignRequirement" ADD COLUMN     "galxeCampaignId" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'NFT',
ALTER COLUMN "contractAddress" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GalxeCampaign" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "numNFTMinted" INTEGER,

    CONSTRAINT "GalxeCampaign_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MerchantCampaignRequirement" ADD CONSTRAINT "MerchantCampaignRequirement_galxeCampaignId_fkey" FOREIGN KEY ("galxeCampaignId") REFERENCES "GalxeCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
