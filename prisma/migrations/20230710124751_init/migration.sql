/*
  Warnings:

  - You are about to drop the column `contractType` on the `NftCollection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NftCollection" DROP COLUMN "contractType",
ADD COLUMN     "tokenType" TEXT NOT NULL DEFAULT 'ERC721';
