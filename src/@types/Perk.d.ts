import { PerkCreateRequestType } from "../typebox/common";

interface BalanceCondition {
  type: 'balance';
  minimumBalance: number;
}

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

declare type PerkCustomCondition = BalanceCondition | TokenIdsCondition | NFTTraitsCondition;

declare interface PerkCreateRequest {
  name: string;
  description: string;
  image: string;
  startPeriod: Date;
  endPeriod: Date;
  claimQuota: number;
  claimPeriod: number;
  claimPeriodUnit: string;
  claimPeriodLimit: number;
  requirementOperator: string;

  // paymentMinimum: number;
  // paymentUnit: string;
  // discountMaximum: number;
  // discountUnit: string;

  shopId: string;
  requirements: {
    chain: string;
    minimumBalance: number;
    customConditions: PerkCustomCondition[];
  }[];

  // benefits: Benefit[];
}

declare type PerkCreateRequest = Static<typeof PerkCreateRequestType>;