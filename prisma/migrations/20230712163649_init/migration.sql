-- CreateTable
CREATE TABLE "Nft" (
    "id" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'ethereum',
    "tokenId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ERC721',
    "name" TEXT NOT NULL,
    "attributes" JSONB NOT NULL,
    "collectionAddress" TEXT NOT NULL,

    CONSTRAINT "Nft_pkey" PRIMARY KEY ("tokenId","chain","collectionAddress")
);

-- AddForeignKey
ALTER TABLE "Nft" ADD CONSTRAINT "Nft_collectionAddress_fkey" FOREIGN KEY ("collectionAddress") REFERENCES "NftCollection"("address") ON DELETE CASCADE ON UPDATE CASCADE;
