import { FastifyRequest, FastifyReply } from 'fastify';
import { prismaClient } from '../../../prisma/index.js';
import { unixToDate } from '../../../utils/dateUtils.js';
import { infuraGetAllOwnedNfts } from '../../nft/helpers.js';

export const campaignGetHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { isActive, shopId, id } = request.query as { isActive: boolean; shopId: string; id: string };

    const campaigns = await prismaClient.merchantCampaign.findMany({
      where: {
        shopId: shopId,
        isActive: isActive,
        id: id,
      },
      include: {
        benefits: true,
        requirements: {
          include: {
            customConditions: true,
            nftCollection: {
              select: {
                id: true,
                address: true,
                chain: true,
                name: true,
                symbol: true,
                image: true,
                opensea: true,
                tokenType: true,
                description: true,
              },
            },
          },
        },
        shop: true,
        usages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    reply.code(200).send(campaigns);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const campaignCreateHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = request.body as CampaignCreateRequest;
    const { id: userId } = request.user;

    const shop = await prismaClient.merchantShop.findUnique({
      where: {
        id: body.shopId,
      },
    });

    if (!shop) {
      return reply.code(400).send({
        code: 'invalid-shop-id',
        error: 'Bad Request',
        message: 'Invalid shop id',
      });
    }

    if (shop.merchantUserId !== userId) {
      return reply.code(400).send({
        code: 'unauthorized',
        error: 'Bad Request',
        message: 'Unauthorized to create campaign for this shop',
      });
    }

    const nowUnix = Date.now() / 1000;
    const isActive = body.startDate <= nowUnix && nowUnix <= body.endDate;

    const campaign = await prismaClient.merchantCampaign.create({
      data: {
        name: body.name,
        description: body.description,
        isActive: isActive,

        startPeriod: unixToDate(body.startDate),
        endPeriod: unixToDate(body.endDate),
        requirementOperator: body.requirementOperator,

        totalQuota: body.totalQuota,
        perUserQuota: body.perUserQuota,
        perUserDailyQuota: body.perUserDailyQuota,
        benefits: {
          create: body.benefits.map((benefit) => ({
            type: benefit.type,
            value: benefit.value,
          })),
        },
        requirements: {
          create: body.requirements.map((requirement) => ({
            contractAddress: requirement.contractAddress.toLowerCase(),
            network: requirement.network,
            minimumHold: requirement.minimumHold,
            customConditions: {
              create: requirement.customConditions.map((customCondition) => ({
                type: customCondition.type,
                properties: customCondition as any,
              })),
            },
          })),
        },
        shopId: body.shopId,
      },
    });

    reply.code(200).send(campaign);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const campaignUpdateHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id: userId } = request.user;

    const body = request.body as Partial<CampaignCreateRequest>;
    const { id } = request.params as { id: string };

    console.log(body);

    // get campaign, its id and shop only
    const currCampaign = await prismaClient.merchantCampaign.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        shop: {
          select: {
            merchantUserId: true,
          },
        },
      },
    });

    if (!currCampaign) {
      return reply.code(400).send({
        code: 'invalid-campaign-id',
        error: 'Bad Request',
        message: 'Invalid campaign id',
      });
    }

    if (currCampaign.shop.merchantUserId !== userId) {
      return reply.code(400).send({
        code: 'unauthorized',
        error: 'Bad Request',
        message: 'Unauthorized to update this campaign',
      });
    }

    const campaign = await prismaClient.merchantCampaign.update({
      where: {
        id: currCampaign.id,
      },
      data: {
        name: body.name,
        description: body.description,
        startPeriod: unixToDate(body.startDate),
        endPeriod: unixToDate(body.endDate),
        requirementOperator: body.requirementOperator,
        totalQuota: body.totalQuota,
        perUserQuota: body.perUserQuota,
        perUserDailyQuota: body.perUserDailyQuota,
        image: body.image,
        benefits: {
          deleteMany: {}, // Delete all existing benefits
          create: body.benefits.map((benefit) => ({
            type: benefit.type,
            value: benefit.value,
          })),
        },
        requirements: {
          deleteMany: {},
          create: body.requirements.map((requirement) => ({
            contractAddress: requirement.contractAddress.toLowerCase(),
            network: requirement.network,
            minimumHold: requirement.minimumHold,
            customConditions: {
              create: requirement.customConditions.map((customCondition) => ({
                type: customCondition.type,
                properties: customCondition as any,
              })),
            },
          })),
        },
        shopId: body.shopId,
      },
    });

    reply.code(200).send(campaign);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const campaignClaimHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const walletAddress = '0x278A2d5B5C8696882d1D2002cE107efc74704ECf';

    const { campaignId, nfts } = request.body as {
      campaignId: string;
      nfts: NftPointer[];
    };

    const campaign = await prismaClient.merchantCampaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    // check campaign quota and user quota
    // if (campaign.totalQuota !== 0 || campaign.perUserQuota !== 0 || campaign.perUserDailyQuota !== 0) {
    //   const currentUsageCount = await prismaClient.merchantCampaignUsage.count({
    //     where: {
    //       campaignId: campaignId,
    //     },
    //   });

    //   console.log(currentUsageCount);

    //   if (campaign.totalQuota !== 0) {
    //     if (currentUsageCount >= campaign.totalQuota) {
    //       console.log('quota exceeded');
    //       return reply.code(400).send({
    //         code: 'quota-exceeded',
    //         error: 'Bad Request',
    //         message: 'All quota for this campaign has been claimed',
    //       });
    //     }
    //   }

    //   if (campaign.perUserQuota !== 0) {
    //     const userUsageCount = await prismaClient.merchantCampaignUsage.count({
    //       where: {
    //         userId: request.user.id,
    //         campaignId: campaignId,
    //       },
    //     });

    //     if (userUsageCount >= campaign.perUserQuota) {
    //       console.log('quota exceeded');
    //       return reply.code(400).send({
    //         code: 'quota-exceeded',
    //         error: 'Bad Request',
    //         message: `Your quota exceeded for this campaign, you can only claim ${campaign.perUserQuota} times`,
    //       });
    //     }
    //   }

    //   if (campaign.perUserDailyQuota !== 0) {
    //     const userUsageCount = await prismaClient.merchantCampaignUsage.count({
    //       where: {
    //         userId: request.user.id,
    //         campaignId: campaignId,
    //         createdAt: {
    //           gte: new Date(new Date().setHours(0, 0, 0, 0)),
    //         },
    //       },
    //     });

    //     if (userUsageCount >= campaign.perUserDailyQuota) {
    //       console.log('quota exceeded');
    //       return reply.code(400).send({
    //         code: 'quota-exceeded',
    //         error: 'Bad Request',
    //         message: `Your daily quota exceeded for this campaign, you can only claim ${campaign.perUserDailyQuota} times per day`,
    //       });
    //     }
    //   }
    // }

    // collect unique ( address, chain } from nfts
    const uniqueNfts = nfts.reduce((acc, curr) => {
      const { address, chainId } = curr;
      const key = `${address}-${chainId}`;
      if (!acc[key]) {
        acc[key] = curr;
      }
      return acc;
    }, {} as Record<string, NftPointer>);

    let userOwnedNfts = [] as InfuraAssetsModel[];

    for (const key in uniqueNfts) {
      const res = await infuraGetAllOwnedNfts(walletAddress, uniqueNfts[key].chainId, [uniqueNfts[key].address]);
      userOwnedNfts = [...userOwnedNfts, ...res];
    }

    console.log('User owned nfts', userOwnedNfts);

    for (const nft of userOwnedNfts) {
      let network = '';
      console.log(nft.chainId);
      if (nft.chainId === 1) {
        network = 'ethereum';
      } else if (nft.chainId === 137) {
        network = 'matic';
      }

      console.log(nft);

      const insertNfts = await prismaClient.nft.upsert({
        create: {
          tokenId: nft.tokenId,
          chain: network,
          type: nft.type,
          name: nft.metadata.name,
          attributes: nft.metadata.attributes,
          collectionAddress: nft.contract.toLowerCase(),
        },
        update: {
          attributes: nft.metadata.attributes,
        },
        where: {
          tokenId_chain_collectionAddress: {
            chain: network,
            tokenId: nft.tokenId,
            collectionAddress: nft.contract.toLowerCase(),
          },
        },
      });

      console.log(insertNfts);
    }

    console.log('Unique NFTs', uniqueNfts);

    console.log({
      campaignId,
      nfts,
    });

    console.log(request.user);

    const usage = await prismaClient.merchantCampaignUsage.create({
      data: {
        campaignId: campaignId,
        userId: request.user.id,
      }
    });


    return reply.code(200).send(usage.id);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const campaignGetClaimDetailHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { claimId } = request.params as { claimId: string };

    const usage = await prismaClient.merchantCampaignUsage.findFirst({
      where: {
        id: claimId,
      },
      include: {
        campaign: {
          include: {
            benefits: true,
            shop: true,
          },
        },
      },
    });

    if(usage.userId !== request.user.id) {
      return reply.code(400).send({
        code: 'forbidden',
        error: 'Bad Request',
        message: 'You are not allowed to view this claim detail',
      });
    }

    return reply.code(200).send(usage);
  } catch (error) {
    console.log(error);
  }
};
