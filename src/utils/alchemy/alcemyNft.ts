import { AlchemyOwnedNftModel } from 'types/Alchemy';
import { alchemyClient } from './index.js';
import { GetOwnersForContractResponse } from 'alchemy-sdk';

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
    pageKey: res.pageKey,
    network: chain,
    total: res.totalCount,
  };

  return data;
};

export const alchemyGetOwnersOfNft = async (
  chainId: number,
  address: string,
  pageKey?: string,
): Promise<
  GetOwnersForContractResponse & {
    // owners: AlchemyNftOwnersModel[]
  }
> => {
  const chain = chainId === 1 ? 'ethereum' : 'matic';

  // if the withTokenBalances is set to true,
  // the response will be an array of objects with the AlchemyNftOwnersModel structure.
  // if the withTokenBalances is set to false,
  // the response will be an array of strings with the owner addresses.
  const res = await alchemyClient(chain).nft.getOwnersForContract(address, { pageKey, withTokenBalances: false });

  return res;
};
