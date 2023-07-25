/*
  Warnings:

  - Added the required column `walletAddress` to the `AssetOwnership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetOwnership" ADD COLUMN     "walletAddress" TEXT NOT NULL;
