import axios from 'axios';

const apiKey = process.env.INFURA_API_KEY;
const apiSecret = process.env.INFURA_API_SECRET;
const baseUrl = 'https://nft.api.infura.io';

const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;

export const infuraGetNftsFromCollection = async (
  chainId = 1 | 137,
  collectionAddress: string,
  cursor?: string,
): Promise<InfuraNftModel> => {
  const res = await axios({
    method: 'GET',
    url: baseUrl + `/networks/${chainId}/nfts/${collectionAddress}/tokens`,
    headers: {
      Authorization: authHeader,
    },
    params: {
      cursor: cursor || undefined,
    },
  });

  return res.data as InfuraNftModel;
};

export const infuraGetOwnedNfts = async (
  chainId: number,
  address: string,
  cursor?: string,
): Promise<InfuraNftModel> => {
  const res = await axios({
    method: 'GET',
    url: baseUrl + `/networks/${chainId}/accounts/${address}/assets/nfts`,
    headers: {
      Authorization: authHeader,
    },
    params: {
      cursor: cursor || undefined,
    },
  });

  return res.data as InfuraNftModel;
};
