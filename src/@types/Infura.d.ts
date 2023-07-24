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

declare interface RarityModel {
  attributes: {
    trait_type: string;
    properties: {
      name: string;
      count: number;
    }[];
  }[];
  total: number;
}

declare interface NftPointer { 
  address: string
  chainId: number
  tokenId: string
}

declare interface OatPointer {
  id: string
}