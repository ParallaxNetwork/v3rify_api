-- DropEnum
DROP TYPE "MerchantType";

-- CreateTable
CREATE TABLE "MerchantPerk" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "endPeriod" TIMESTAMP(3) NOT NULL,
    "image" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantPerk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantPerkRequirement" (
    "id" TEXT NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "minimumBalance" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantPerkRequirement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MerchantPerk" ADD CONSTRAINT "MerchantPerk_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "MerchantShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
