/*
  Warnings:

  - You are about to drop the column `nftType` on the `MerchantPerkRequirement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MerchantPerk" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MerchantPerkRequirement" DROP COLUMN "nftType";

-- CreateTable
CREATE TABLE "NftCollection" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "contractType" TEXT NOT NULL DEFAULT 'ERC721',
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NftCollection_pkey" PRIMARY KEY ("address","chain")
);

-- CreateIndex
CREATE UNIQUE INDEX "NftCollection_address_key" ON "NftCollection"("address");

-- AddForeignKey
ALTER TABLE "MerchantPerkRequirement" ADD CONSTRAINT "MerchantPerkRequirement_nftAddress_fkey" FOREIGN KEY ("nftAddress") REFERENCES "NftCollection"("address") ON DELETE CASCADE ON UPDATE CASCADE;
