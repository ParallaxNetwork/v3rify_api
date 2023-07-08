/*
  Warnings:

  - Made the column `description` on table `MerchantShop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MerchantShop" ALTER COLUMN "description" SET NOT NULL;
