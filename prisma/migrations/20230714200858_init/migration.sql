-- AlterTable
ALTER TABLE "MerchantCampaignBenefit" ADD COLUMN     "description" TEXT,
ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "value" DROP DEFAULT,
ALTER COLUMN "value" SET DATA TYPE TEXT;
