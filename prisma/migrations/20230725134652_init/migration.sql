/*
  Warnings:

  - You are about to drop the column `chain` on the `AssetOwnership` table. All the data in the column will be lost.
  - Added the required column `chainId` to the `AssetOwnership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetOwnership" DROP COLUMN "chain",
ADD COLUMN     "chainId" INTEGER NOT NULL;
