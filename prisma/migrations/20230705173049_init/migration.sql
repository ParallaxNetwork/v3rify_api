/*
  Warnings:

  - You are about to drop the column `customConditions` on the `MerchantPerkRequirement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MerchantPerkRequirement" DROP COLUMN "customConditions";

-- CreateTable
CREATE TABLE "MerchantPerkCustomCondition" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'balance',
    "properties" JSONB NOT NULL,
    "perkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantPerkCustomCondition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MerchantPerkCustomCondition" ADD CONSTRAINT "MerchantPerkCustomCondition_perkId_fkey" FOREIGN KEY ("perkId") REFERENCES "MerchantPerkRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
