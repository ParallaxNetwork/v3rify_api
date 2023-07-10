/*
  Warnings:

  - You are about to drop the column `discountMaximum` on the `MerchantPerk` table. All the data in the column will be lost.
  - You are about to drop the column `discountUnit` on the `MerchantPerk` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMinimum` on the `MerchantPerk` table. All the data in the column will be lost.
  - You are about to drop the column `paymentUnit` on the `MerchantPerk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MerchantPerk" DROP COLUMN "discountMaximum",
DROP COLUMN "discountUnit",
DROP COLUMN "paymentMinimum",
DROP COLUMN "paymentUnit";
