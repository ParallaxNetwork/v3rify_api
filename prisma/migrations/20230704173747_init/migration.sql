-- CreateTable
CREATE TABLE "MerchantWhitelist" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'wallet',
    "value" TEXT NOT NULL,

    CONSTRAINT "MerchantWhitelist_pkey" PRIMARY KEY ("id")
);
