/*
  Warnings:

  - You are about to drop the column `owner` on the `NftCollection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Nft" ADD COLUMN     "owner" TEXT;

-- AlterTable
ALTER TABLE "NftCollection" DROP COLUMN "owner";
