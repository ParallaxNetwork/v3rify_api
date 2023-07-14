interface TokenIdsCondition {
  type: 'tokenIds';
  tokenIds: number[];
}

interface NFTTraitsCondition {
  type: 'nftTraits';
  nftTraits: {
    trait_type: string;
    value: string;
  }[];
}

declare type CampaignCustomCondition = TokenIdsCondition | NFTTraitsCondition;

declare interface CampaignRequirementItem {
  contractAddress: string
  minimumHold: number
  network: string
  customConditions: CampaignCustomCondition[]
}

declare interface CampaignBenefitItem {
  id: string
  type: 'free-item' | 'discount'
  value: string
  description: string
}

declare interface CampaignCreateRequest {
  name: string;
  description: string;
  image: string;

  requirementOperator: 'and' | 'or';
  requirement: CampaignRequirementItem[];
  benefit: CampaignBenefitItem[];

  startDate: number;
  endDate: number;

  totalQuota: number | null;
  perUserQuota: number | null;
  perUserDailyQuota: number | null;

  shopId: string;
}