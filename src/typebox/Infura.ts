import { Type } from '@sinclair/typebox';

const InfuraAttributesModelType = Type.Object({
  trait_type: Type.String(),
  value: Type.String(),
});

const InfuraMetadataModelType = Type.Object({
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  image: Type.Optional(Type.String()),
  animation_url: Type.Optional(Type.String()),
  external_url: Type.Optional(Type.String()),
  attributes: Type.Optional(Type.Array(InfuraAttributesModelType)),
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
