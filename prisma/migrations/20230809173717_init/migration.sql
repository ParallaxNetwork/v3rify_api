/*
  Warnings:

  - Added the required column `holders` to the `NftCollection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NftCollection" ADD COLUMN     "holders" JSONB NOT NULL;
