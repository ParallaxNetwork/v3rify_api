import { Network, Alchemy, AlchemyConfig } from 'alchemy-sdk';

const settings: Partial<AlchemyConfig> = {
  apiKey: process.env.ALCHEMY_API_KEY as string,
  maxRetries: 5
};

export const alchemyClient = (chain: 'ethereum' | 'matic'):Alchemy => {
  const client = new Alchemy({
    ...settings,
    network: chain === 'ethereum' ? Network.ETH_MAINNET : Network.MATIC_MAINNET
  })

  return client
}