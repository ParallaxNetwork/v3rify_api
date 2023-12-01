import { OwnedNft, OwnedNftsResponse } from 'alchemy-sdk';

declare interface AlchemyMetadataModel {
  name: string;
  description: string;
  tokenId: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  creator?: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

declare interface AlchemyMediaModel {
  gateway: string;
  thumbnail: string;
  raw: string;
  format: string;
  bytes: number;
}

declare interface AlchemyContractModel {
  address: string;
  name: string;
  symbol?: string;
  totalSupply?: number;
  tokenType: string;
  openSea: {
    floorPrice?: number;
    collectionName?: string;
    safelistRequestStatus?: string;
    imageUrl?: string;
    description?: string;
    externalUrl?: string;
    twitterUsername?: string;
    discordUrl?: string;
    lastIngestedAt: string;
  };
  contractDeployer: string;
  deployedBlockNumber: number;
}

declare type AlchemyAssetsModel = OwnedNft & {
  chainId?: number;
  supply?: string;
  type?: string;
  metadata?: OwnedNft['rawMetadata'];
};

declare interface AlchemyOwnedNftModel {
  network: string;
  total: number;
  account: string;
  pageKey: OwnedNftsResponse['pageKey'];
  assets: AlchemyAssetsModel[];
}

declare interface AlchemyNftOwnersModel {
  ownerAddress: string;
  tokenBalances: {
    tokenId: string;
    balance: number;
  }[];
}
