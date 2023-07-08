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

declare type PerksCustomCondition = BalanceCondition | TokenIdsCondition | NFTTraitsCondition;
