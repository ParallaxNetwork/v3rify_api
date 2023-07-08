-- AlterTable
ALTER TABLE "MerchantPerk" ADD COLUMN     "discountMaximum" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discountUnit" TEXT NOT NULL DEFAULT 'IDR',
ADD COLUMN     "paymentMinimum" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paymentUnit" TEXT NOT NULL DEFAULT 'IDR';

-- CreateTable
CREATE TABLE "MerchantPerkUsage" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "valueUnit" TEXT NOT NULL DEFAULT 'percent',
    "nftIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paymentTotal" INTEGER NOT NULL DEFAULT 0,
    "paymentUnit" TEXT NOT NULL DEFAULT 'IDR',
    "perkValue" INTEGER NOT NULL DEFAULT 0,
    "perkValueUnit" TEXT NOT NULL DEFAULT 'IDR',
    "perkId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantPerkUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MerchantPerkUsage" ADD CONSTRAINT "MerchantPerkUsage_perkId_fkey" FOREIGN KEY ("perkId") REFERENCES "MerchantPerk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantPerkUsage" ADD CONSTRAINT "MerchantPerkUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantPerkUsage" ADD CONSTRAINT "MerchantPerkUsage_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "MerchantPerkBenefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
