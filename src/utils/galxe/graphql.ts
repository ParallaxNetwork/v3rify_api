import { GraphQLClient, gql } from 'graphql-request';
export const GalxeGraphqlClient = new GraphQLClient('https://graphigo.prd.galaxy.eco/query');

/* --------------------------------- Queries -------------------------------- */
const PROFILE_NFTS = gql`
  query ProfileNFTs($address: String!, $nftOptions: ListNFTInput!) {
    addressInfo(address: $address) {
      nfts(option: $nftOptions) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        list {
          id
          name
          image
          powah
          category
          treasureBack
          animationURL
          campaign {
            id
            chain
            name
            type
            status
            description
            thumbnail
          }
          nftCore {
            contractAddress
          }
        }
      }
    }
  }
`;

const CAMPAIGN = gql`
  query Campaign($campaignId: ID!) {
    campaign(id: $campaignId) {
      id
      name
      type
      status
      description
      thumbnail
      numNFTMinted
      chain
      metrics
    }
  }
`;

/* ---------------------------- Called Functions ---------------------------- */

export async function fetchGalxeProfileOATs({ address }: { address: string }): Promise<GalxeOATItem[] | null> {
  // Changed the return type
  try {
    let endCursor = '-1';
    let hasNextPage = true;
    const userOATs: GalxeOATItem[] = []; // Explicitly typed

    const baseVariables = {
      address: address,
      nftOptions: {
        first: 25,
        orderBy: 'CreateTime',
        order: 'DESC',
        types: ['Oat'],
        chains: [],
      },
    };

    while (hasNextPage) {
      const variables = {
        ...baseVariables,
        nftOptions: {
          ...baseVariables.nftOptions,
          after: endCursor,
        },
      };

      const res = (await GalxeGraphqlClient.request(PROFILE_NFTS, variables)) as {
        addressInfo: {
          nfts: {
            totalCount: number;
            pageInfo: {
              endCursor: string;
              hasNextPage: boolean;
            };
            list: GalxeOATItem[];
          };
        };
      };

      console.log(res);

      if (res.addressInfo.nfts.list) {
        userOATs.push(...res.addressInfo.nfts.list);
      }

      hasNextPage = res.addressInfo.nfts.pageInfo.hasNextPage;
      if (hasNextPage) {
        endCursor = res.addressInfo.nfts.pageInfo.endCursor;
      }
    }

    return userOATs;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export async function fetchGalxeCampaign({ campaignId }: { campaignId: string }): Promise<GalxeCampaign> {
  try {
    const res = (await GalxeGraphqlClient.request(CAMPAIGN, { campaignId: campaignId })) as {
      campaign: GalxeCampaign;
    };

    return res.campaign;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Campaign not found');
  }
}
