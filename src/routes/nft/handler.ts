import { FastifyReply, FastifyRequest } from 'fastify';
import { prismaClient } from '../../prisma/index.js';
import { alchemyClient } from '../../utils/alchemy/index.js';
import {
  alchemyGetAllOwnedNfts,
  generateOwnershipPointer,
  infuraGetAllNfts,
  infuraGetAllOwnedNfts,
  infuraGetAllOwnersOfNft,
  summarizeNftAttributes,
} from './helpers.js';
import { fetchGalxeCampaign, fetchGalxeProfileOATs } from '../../utils/galxe/graphql.js';
import { manyMinutesAgo } from '../../utils/dateUtils.js';
import { AlchemyOwnedNftModel } from 'types/Alchemy.js';

const saveNft = async ({ nfts, id, chain }: { nfts: InfuraAssetsModel[]; id: string; chain: 'ethereum' | 'matic' }) => {
  for (let i = 0; i < nfts.length; i++) {
    await prismaClient.nft.upsert({
      create: {
        tokenId: nfts[i].tokenId,
        chain: chain,
        type: nfts[i].type,
        name: nfts[i].metadata.name,
        attributes: nfts[i].metadata.attributes,
        collectionAddress: id.toLowerCase(),
        owner: nfts[i].owner,
      },
      update: {
        name: nfts[i].metadata.name,
        attributes: nfts[i].metadata.attributes,
      },
      where: {
        tokenId_chain_collectionAddress: {
          chain: chain,
          tokenId: nfts[i].tokenId,
          collectionAddress: id.toLowerCase(),
        },
      },
    });
  }
};

export const nftGetCollectionMetadataHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id, chain } = request.query as { id: string; chain: 'ethereum' | 'matic' };
    // find collection metadata
    const existing = await prismaClient.nftCollection.findUnique({
      where: {
        address_chain: {
          address: id.toLowerCase(),
          chain: chain,
        },
      },
    });

    if (existing) {
      // if data is updated within 15 minutes, return existing
      // if (existing.updatedAt > manyMinutesAgo(15)) {
      return reply.code(200).send(existing);
      // }
    }

    const nftWithOwner = await infuraGetAllOwnersOfNft(id, chain);
    const collectionAttributesSummary = summarizeNftAttributes(nftWithOwner);

    // holders consist of {owner: string, tokenIds: string[]}
    const holders = [];
    for (let i = 0; i < nftWithOwner.length; i++) {
      const owner = nftWithOwner[i].owner;
      const tokenId = nftWithOwner[i].tokenId;
      const index = holders.findIndex((holder) => holder.owner === owner);
      if (index === -1) {
        holders.push({
          owner: owner,
          tokenIds: [tokenId],
        });
      } else {
        holders[index].tokenIds.push(tokenId);
      }
    }

    // sort holders by .tokenIds.length
    holders.sort((a, b) => b.tokenIds.length - a.tokenIds.length);

    const allNfts = nftWithOwner;

    const collectionMetadata = await alchemyClient(chain).nft.getContractMetadata(id);
    if (collectionMetadata.tokenType !== 'ERC721' && collectionMetadata.tokenType !== 'ERC1155') {
      return reply.code(400).send({
        code: 'invalid_collection',
        error: 'Bad Request',
        message: 'Invalid collection. Make sure you are inputting the right network and collection address.',
      });
    }

    console.log('collectionMetadata', collectionMetadata);

    // try {
    //   const collectionAttributesSummaryAlchemy = await alchemyClient(chain).nft.summarizeNftAttributes(id);
    //   console.log('collectionAttributesSummaryAlchemy', collectionAttributesSummaryAlchemy);
    // } catch (error) {
    //   return reply.code(400).send({
    //     code: 'invalid_collection',
    //     error: 'Bad Request',
    //     message: error,
    //   });
    // }

    // get all nfts
    // const allNfts = await infuraGetAllNfts(id, chain);
    // console.log('allNfts', allNfts[0]);
    // const collectionAttributesSummary = summarizeNftAttributes(allNfts);

    const metadata = await prismaClient.nftCollection.upsert({
      where: {
        address_chain: {
          address: id.toLowerCase(),
          chain: chain,
        },
      },
      create: {
        address: id.toLowerCase(),
        name: collectionMetadata.name,
        symbol: collectionMetadata.symbol,
        tokenType: collectionMetadata.tokenType,
        chain: chain,
        opensea: { ...collectionMetadata.openSea },
        description: collectionMetadata.openSea.description,
        image: collectionMetadata.openSea.imageUrl,
        rarity: { ...collectionAttributesSummary },
        holders: holders,
      },
      update: {
        name: collectionMetadata.name,
        symbol: collectionMetadata.symbol,
        opensea: { ...collectionMetadata.openSea },
        description: collectionMetadata.openSea.description,
        image: collectionMetadata.openSea.imageUrl,
        rarity: { ...collectionAttributesSummary },
        holders: holders,
      },
    });

    saveNft({
      nfts: allNfts,
      id: id,
      chain: chain,
    });

    return reply.code(200).send(metadata);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal_server_error',
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const nftGetOATMetadataHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { campaignId } = request.query as { campaignId: string };

    const existing = await prismaClient.galxeCampaign.findUnique({
      where: {
        campaignId: campaignId,
      },
    });

    if (existing) {
      // if data is updated within 15 minutes, return existing
      if (existing.updatedAt > manyMinutesAgo(15)) {
        return reply.code(200).send(existing);
      }
    }

    const res = await fetchGalxeCampaign({
      campaignId: campaignId,
    });

    console.log('res', res);

    // upsert to db
    const campaign = await prismaClient.galxeCampaign.upsert({
      where: {
        campaignId: campaignId,
      },
      create: {
        campaignId: campaignId,
        chain: res.chain,
        name: res.name,
        type: res.type,
        status: res.status,
        description: res.description,
        thumbnail: res.thumbnail,
        numNFTMinted: res.numNFTMinted,
      },
      update: {
        name: res.name,
        type: res.type,
        status: res.status,
        description: res.description,
        thumbnail: res.thumbnail,
        numNFTMinted: res.numNFTMinted,
      },
    });

    return reply.code(200).send(campaign);
  } catch (error) {
    console.log(error);

    if (error.message.includes('not found')) {
      return reply.code(404).send({
        code: 'not_found',
        error: 'Not Found',
        message: 'OAT not found, please check the Campaign ID',
      });
    }

    return reply.code(500).send({
      code: 'internal_server_error',
      error: 'Internal Server Error',
      message: 'Failed to get OAT metadata',
    });
  }
};

export const nftGetOwnedNftsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.user as { id: string };
    const { address } = request.query as { address: string };

    const ownedNfts: AlchemyOwnedNftModel['assets'] = [];

    const chainIds = [1, 137];

    for (let i = 0; i < chainIds.length; i++) {
      const nfts = await alchemyGetAllOwnedNfts(address, chainIds[i]);
      ownedNfts.push(...nfts);
    }

    console.log(ownedNfts);

    // replace assetOwnership
    await prismaClient.assetOwnership.deleteMany({
      where: {
        walletAddress: address,
        type: 'NFT',
      },
    });

    await prismaClient.assetOwnership.createMany({
      data: ownedNfts.map((nft) => {
        return {
          pointer: generateOwnershipPointer({
            type: 'NFT',
            chainId: nft.chainId,
            address: nft.contract.address,
          }),
          walletAddress: address,
          chainId: nft.chainId,
          type: 'NFT',
          tokenId: nft.tokenId,
        };
      }),
      skipDuplicates: true,
    });

    return reply.code(200).send(ownedNfts);
  } catch (error) {
    console.log(error);
    reply.code(500).send({
      code: 'internal_server_error',
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const nftGetOwnerOatsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { address } = request.query as { address: string };

    const getOATs = await fetchGalxeProfileOATs({
      address: address,
    });

    // replace assetOwnership
    await prismaClient.assetOwnership.deleteMany({
      where: {
        walletAddress: address,
        type: 'OAT',
      },
    });

    await prismaClient.assetOwnership.createMany({
      data: getOATs.map((oat) => {
        let chainId = 0;
        if (oat.campaign.chain.toLowerCase() === 'ethereum') {
          chainId = 1;
        } else if (oat.campaign.chain.toLowerCase() === 'matic') {
          chainId = 137;
        }

        return {
          pointer: generateOwnershipPointer({
            type: 'OAT',
            campaignId: oat.campaign.id,
            id: oat.id,
          }),
          walletAddress: address,
          chainId: chainId,
          type: 'OAT',
          tokenId: oat.id,
        };
      }),
    });

    return reply.code(200).send(getOATs);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal_server_error',
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
