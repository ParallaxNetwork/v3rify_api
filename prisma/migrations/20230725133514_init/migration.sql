/*
  Warnings:

  - Added the required column `pointer` to the `AssetOwnership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetOwnership" ADD COLUMN     "pointer" TEXT NOT NULL;
