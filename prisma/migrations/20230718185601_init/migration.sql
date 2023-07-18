-- AddForeignKey
ALTER TABLE "Nft" ADD CONSTRAINT "Nft_collectionAddress_fkey" FOREIGN KEY ("collectionAddress") REFERENCES "NftCollection"("address") ON DELETE CASCADE ON UPDATE CASCADE;
