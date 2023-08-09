/*
  Warnings:

  - The `holders` column on the `NftCollection` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "NftCollection" DROP COLUMN "holders",
ADD COLUMN     "holders" JSONB[];
