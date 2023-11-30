import { alchemyClient } from '.';
import { AlchemyOwnedNftModel } from 'types/Alchemy';

export const alchemyGetOwnedNfts = async (
  chainId: number,
  address: string,
  pageKey?: string,
  tokenAddresses?: string[],
): Promise<AlchemyOwnedNftModel> => {
  const chain = chainId === 1 ? 'ethereum' : 'matic';

  const res = await alchemyClient(chain).nft.getNftsForOwner(address, { contractAddresses: tokenAddresses, pageKey });

  const data: AlchemyOwnedNftModel = {
    assets: res.ownedNfts as any,
    account: address,
    pageKey,
    network: chain,
    total: res.totalCount,
  };

  return data;
};
