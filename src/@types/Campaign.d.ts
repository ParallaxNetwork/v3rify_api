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

// declare interface CampaignRequirementItem {
//   contractAddress: string;
//   minimumHold: number;
//   network: string;
//   customConditions: CampaignCustomCondition[];
// }

type RequirementNFTType = "NFT" | "OAT"

interface NFTRequirementProperties {
  type: 'NFT',
  minimumHold: number;
  contractAddress: string;
  network: string;
  customConditions?: CampaignCustomCondition[];
}

interface OATRequirementProperties {
  type: 'OAT',
  galxeCampaignId: string;
  minimumHold: number;
  campaign: GalxeCampaign
}

interface CampaignRequirementBase {
  id: string;
  type: RequirementNFTType;
}

type CampaignRequirementItem = CampaignRequirementBase & (NFTRequirementProperties | OATRequirementProperties)

declare interface CampaignBenefitItem {
  id: string;
  type: 'free-item' | 'discount';
  value: string;
  description: string;
}

declare interface CampaignCreateRequest {
  name: string;
  description: string;
  image: string;

  requirementOperator: 'and' | 'or';
  requirements: CampaignRequirementItem[];
  benefits: CampaignBenefitItem[];

  startDate: number;
  endDate: number;

  totalQuota: number | null;
  perUserQuota: number | null;
  perUserDailyQuota: number | null;

  shopId: string;
}

declare interface CampaignTransaction {
  id: string;
  campaignId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  campaign: {
    id: string;
    name: string;
    description: string;
    image: string;
  };
  user: {
    id: string;
    walletAddress: string;
  };
}
