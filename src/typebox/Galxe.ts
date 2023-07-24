import { Type } from '@sinclair/typebox';

export const GalxeCampaignType = Type.Object({
  id: Type.String(),
  chain: Type.String(),
  name: Type.String(),
  type: Type.String(),
  status: Type.String(),
  description: Type.Optional(Type.String()),
  thumbnail: Type.Optional(Type.String()),
  numNFTMinted: Type.Optional(Type.Number()),
});

const GalxeNFTCoreType = Type.Object({
  contractAddress: Type.String(),
});

export const GalxeOATItemType = Type.Object({
  id: Type.String(),
  name: Type.String(),
  image: Type.String(),
  powah: Type.Number(),
  category: Type.String(),
  treasureBack: Type.Boolean(),
  animationURL: Type.String(),
  campaign: GalxeCampaignType,
  nftCore: GalxeNFTCoreType,
});
