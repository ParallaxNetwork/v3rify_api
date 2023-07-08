/*
  Warnings:

  - Added the required column `claimQuota` to the `MerchantPerk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startPeriod` to the `MerchantPerk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perkId` to the `MerchantPerkRequirement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MerchantPerk" ADD COLUMN     "claimPeriod" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "claimPeriodLimit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "claimPeriodUnit" TEXT NOT NULL DEFAULT 'day',
ADD COLUMN     "claimQuota" INTEGER NOT NULL,
ADD COLUMN     "startPeriod" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MerchantPerkRequirement" ADD COLUMN     "nftType" TEXT NOT NULL DEFAULT 'ERC721',
ADD COLUMN     "perkId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MerchantPerkBenefit" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'discount',
    "value" INTEGER NOT NULL DEFAULT 0,
    "valueUnit" TEXT NOT NULL DEFAULT 'percent',
    "perkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantPerkBenefit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MerchantPerkRequirement" ADD CONSTRAINT "MerchantPerkRequirement_perkId_fkey" FOREIGN KEY ("perkId") REFERENCES "MerchantPerk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantPerkBenefit" ADD CONSTRAINT "MerchantPerkBenefit_perkId_fkey" FOREIGN KEY ("perkId") REFERENCES "MerchantPerk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
