import { Type } from '@sinclair/typebox';

const InfuraAttributesModelType = Type.Object({
  trait_type: Type.String(),
  value: Type.String(),
});

const InfuraMetadataModelType = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String()),
  image: Type.String(),
  animation_url: Type.Optional(Type.String()),
  external_url: Type.Optional(Type.String()),
  // attributes: Type.Optional(Type.Array(InfuraAttributesModelType)),
  attributes: Type.Optional(Type.Any()),
});

const InfuraAssetsModelType = Type.Object({
  contract: Type.String(),
  tokenId: Type.String(),
  supply: Type.String(),
  type: Type.String(),
  metadata: InfuraMetadataModelType,
  chainId: Type.Optional(Type.Number()),
});

export { InfuraAssetsModelType };
