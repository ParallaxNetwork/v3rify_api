/*
  Warnings:

  - You are about to drop the column `userId` on the `AssetOwnership` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `AssetOwnership` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssetOwnership" DROP CONSTRAINT "AssetOwnership_userId_fkey";

-- AlterTable
ALTER TABLE "AssetOwnership" DROP COLUMN "userId",
DROP COLUMN "walletAddress";
