/*
  Warnings:

  - You are about to drop the column `size` on the `UploadedFile` table. All the data in the column will be lost.
  - Made the column `phoneNumber` on table `MerchantShop` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `MerchantShop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MerchantShop" ALTER COLUMN "phoneNumber" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "UploadedFile" DROP COLUMN "size";
