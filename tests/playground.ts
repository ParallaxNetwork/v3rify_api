const balanceCondition = {
  type: 'balance',
  minimumBalance: 2
}

const tokenIdsCondition = {
  type: 'tokenIds',
  tokenIds: [1, 2, 3]
}

const nftTraitsCondition = {
  type: 'nftTraits',
  nftTraits: [
    {
      trait_type: 'Background',
      value: 'Red'
    },
    {
      trait_type: 'Eyes',
      value: 'Blue'
    }
  ]
}