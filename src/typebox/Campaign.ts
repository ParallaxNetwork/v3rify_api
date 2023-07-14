import { Static, Type,  } from '@sinclair/typebox';

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

const CampaignCustomCondition = Type.Union([TokenIdsCondition, NFTTraitsCondition]);

const CampaignRequirementItem = Type.Object({
  contractAddress: Type.String(),
  minimumHold: Type.Number(),
  network: Type.String(),
  customConditions: Type.Array(CampaignCustomCondition),
});

const CampaignBenefitItem = Type.Object({
  id: Type.String(),
  type: Type.Union([Type.Literal('free-item'), Type.Literal('discount')]),
  value: Type.String(),
  description: Type.String(),
});

export const CampaignCreateRequestSchema = Type.Object({
  name: Type.String(),
  description: Type.String(),
  image: Type.Optional(Type.String()),

  requirementOperator: Type.Union([Type.Literal('and'), Type.Literal('or')]),
  requirement: Type.Array(CampaignRequirementItem),
  benefit: Type.Array(CampaignBenefitItem),

  startDate: Type.Number(),
  endDate: Type.Number(),

  totalQuota: Type.Union([Type.Number(), Type.Null()]),
  perUserQuota: Type.Union([Type.Number(), Type.Null()]),
  perUserDailyQuota: Type.Union([Type.Number(), Type.Null()]),

  shopId: Type.String(),
});
