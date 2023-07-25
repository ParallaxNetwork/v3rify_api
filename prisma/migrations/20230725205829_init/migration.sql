/*
  Warnings:

  - Added the required column `tokenId` to the `AssetOwnership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetOwnership" ADD COLUMN     "tokenId" TEXT NOT NULL;
