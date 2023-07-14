-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "ensName" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT,
    "walletAddress" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantWhitelist" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'wallet',
    "value" TEXT NOT NULL,

    CONSTRAINT "MerchantWhitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantShop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "merchantUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantShop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "startPeriod" TIMESTAMP(3) NOT NULL,
    "endPeriod" TIMESTAMP(3) NOT NULL,
    "requirementOperator" TEXT NOT NULL DEFAULT 'or',
    "totalQuota" INTEGER DEFAULT 0,
    "perUserQuota" INTEGER DEFAULT 0,
    "perUserDailyQuota" INTEGER DEFAULT 0,
    "shopId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCampaignRequirement" (
    "id" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "minimumBalance" INTEGER NOT NULL DEFAULT 1,
    "campaignId" TEXT NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaignRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCampaignCustomCondition" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'balance',
    "properties" JSONB NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaignCustomCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCampaignBenefit" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'discount',
    "value" INTEGER NOT NULL DEFAULT 0,
    "valueUnit" TEXT NOT NULL DEFAULT 'percent',
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaignBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCampaignUsage" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "valueUnit" TEXT NOT NULL DEFAULT 'percent',
    "nftIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paymentTotal" INTEGER NOT NULL DEFAULT 0,
    "paymentUnit" TEXT NOT NULL DEFAULT 'IDR',
    "campaignValue" INTEGER NOT NULL DEFAULT 0,
    "campaignValueUnit" TEXT NOT NULL DEFAULT 'IDR',
    "campaignId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCampaignUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NftCollection" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL DEFAULT 'ERC721',
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "opensea" JSONB NOT NULL,
    "rarity" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NftCollection_pkey" PRIMARY KEY ("address","chain")
);

-- CreateTable
CREATE TABLE "Nft" (
    "id" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "tokenId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ERC721',
    "name" TEXT,
    "attributes" JSONB,
    "collectionAddress" TEXT NOT NULL,

    CONSTRAINT "Nft_pkey" PRIMARY KEY ("tokenId","chain","collectionAddress")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_username_key" ON "Merchant"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_walletAddress_key" ON "Merchant"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "NftCollection_address_key" ON "NftCollection"("address");

-- CreateIndex
CREATE UNIQUE INDEX "UploadedFile_path_key" ON "UploadedFile"("path");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantShop" ADD CONSTRAINT "MerchantShop_merchantUserId_fkey" FOREIGN KEY ("merchantUserId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaign" ADD CONSTRAINT "MerchantCampaign_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "MerchantShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignRequirement" ADD CONSTRAINT "MerchantCampaignRequirement_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MerchantCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignRequirement" ADD CONSTRAINT "MerchantCampaignRequirement_nftAddress_fkey" FOREIGN KEY ("nftAddress") REFERENCES "NftCollection"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignCustomCondition" ADD CONSTRAINT "MerchantCampaignCustomCondition_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MerchantCampaignRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignBenefit" ADD CONSTRAINT "MerchantCampaignBenefit_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MerchantCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignUsage" ADD CONSTRAINT "MerchantCampaignUsage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MerchantCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignUsage" ADD CONSTRAINT "MerchantCampaignUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCampaignUsage" ADD CONSTRAINT "MerchantCampaignUsage_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "MerchantCampaignBenefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nft" ADD CONSTRAINT "Nft_collectionAddress_fkey" FOREIGN KEY ("collectionAddress") REFERENCES "NftCollection"("address") ON DELETE CASCADE ON UPDATE CASCADE;
