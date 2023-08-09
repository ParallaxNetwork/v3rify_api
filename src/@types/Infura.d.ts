declare interface InfuraMetadataModel {
  name: string;
  description: string;
  contract: string;
  tokenId: string;
  image: string;
  animation_url?: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

declare interface InfuraAssetsModel {
  contract: string;
  tokenId: string;
  supply: string;
  type: string;
  metadata: InfuraMetadataModel;
  chainId?: number;
  owner?: string;
}

declare interface InfuraNftModel {
  pageNumber: number;
  pageSize: number;
  network: string;
  total: number;
  account: string;
  cursor: string | null;
  assets: InfuraAssetsModel[];
}

declare interface InfuraNftOwnersModel {
  tokenAddress: string;
  tokenId: string;
  amount: string;
  ownerOf: string;
  tokenHash: string;
  blockNumberMinted: string;
  blockNumber: string;
  contractType: string;
  name: string;
  symbol: string;
  metadata: InfuraMetadataModel | string
}

declare interface InfuraOwnersModel {
  total: number;
  pageNumber: number;
  pageSize: number;
  cursor: string | null;
  network: string;
  owners: InfuraNftOwnersModel[];
}

declare interface RarityModel {
  attributes: {
    trait_type: string;
    properties: {
      name: string;
      count: number;
      uniqueOwners: string[]
    }[];
  }[];
  total: number;
}

declare interface NftPointer {
  address: string;
  chainId: number;
  tokenId: string;
}

declare interface OatPointer {
  id: string;
  campaignId: string;
}
