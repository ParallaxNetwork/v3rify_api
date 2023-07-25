type OwnershipType = "NFT" | "OAT";

interface NFTPointerParams {
  type: "NFT";
  address: string;
  chainId: number;
}

interface OATPointerParams {
  type: "OAT";
  id: string;
  campaignId: string;
}

type OwnershipPointerParams = NFTPointerParams | OATPointerParams;
