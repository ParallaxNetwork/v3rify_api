/*
  Warnings:

  - A unique constraint covering the columns `[campaignId]` on the table `GalxeCampaign` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GalxeCampaign_campaignId_key" ON "GalxeCampaign"("campaignId");
