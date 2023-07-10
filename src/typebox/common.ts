import { Static, Type } from '@sinclair/typebox';

export const ErrorSchema = Type.Object({
  code: Type.String(),
  error: Type.String(),
  message: Type.String(),
});

export const ShopType = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
    description: Type.String(),
    address: Type.String(),
    phoneNumber: Type.String(),
    email: Type.String(),
    image: Type.String(),
    createdAt: Type.String(),
    updatedAt: Type.String(),
  },
  {
    description: 'Shop',
  },
);

export const ShopEditType = Type.Object({
  name: Type.String(),
  description: Type.String(),
  address: Type.String(),
  phoneNumber: Type.String(),
  email: Type.String(),
  image: Type.String(),
})

/* ---------------------------------- Perk --------------------------------- */
const BalanceCondition = Type.Object({
  type: Type.Literal('balance'),
  minimumBalance: Type.Number(),
});

const TokenIdsCondition = Type.Object({
  type: Type.Literal('tokenIds'),
  tokenIds: Type.Array(Type.Number()),
});

const NFTTraitsCondition = Type.Object({
  type: Type.Literal('nftTraits'),
  nftTraits: Type.Array(Type.Object({
    trait_type: Type.String(),
    value: Type.String(),
  })),
});

const PerkCustomCondition = Type.Union([BalanceCondition, TokenIdsCondition, NFTTraitsCondition]);

export const PerkCreateRequestType = Type.Object({
  name: Type.String(),
  description: Type.String(),
  image: Type.String(),
  startPeriod: Type.String({ format: 'date-time' }),
  endPeriod: Type.String({ format: 'date-time' }),
  claimQuota: Type.Number(),
  claimPeriod: Type.Number(),
  claimPeriodUnit: Type.String(),
  claimPeriodLimit: Type.Number(),
  requirementOperator: Type.String(),
  shopId: Type.String(),
  requirements: Type.Array(Type.Object({ 
    chain: Type.String(),
    minimumBalance: Type.Number(),
    customConditions: Type.Array(PerkCustomCondition),
  })),
});