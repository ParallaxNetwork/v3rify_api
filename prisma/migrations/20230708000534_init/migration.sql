/*
  Warnings:

  - You are about to drop the column `name` on the `UploadedFile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[path]` on the table `UploadedFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `UploadedFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UploadedFile" DROP COLUMN "name",
ADD COLUMN     "path" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UploadedFile_path_key" ON "UploadedFile"("path");
