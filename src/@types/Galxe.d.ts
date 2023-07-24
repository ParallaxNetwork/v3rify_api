declare interface GalxeNFTCore {
  contractAddress: string;
}

declare interface GalxeOATItem {
  id: string;
  name: string;
  image: string;
  powah: number;
  category: string;
  treasureBack: boolean;
  animationURL: string;
  campaign: GalxeCampaign;
  nftCore: GalxeNFTCore;
}

declare interface GalxeCampaign {
  id: string;
  chain: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  thumbnail?: string;
  numNFTMinted?: number;
}
