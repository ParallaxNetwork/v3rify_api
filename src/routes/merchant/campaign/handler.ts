import { FastifyRequest, FastifyReply } from 'fastify';
import add from 'date-fns/add';
import { prismaClient } from '../../../prisma/index.js';
import { manyMinutesAgo, unixToDate } from '../../../utils/dateUtils.js';
import { getNftPointersFromCampaignRequirement } from './helpers.js';
import { Prisma } from '@prisma/client';

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
            campaign: {
              include: {
                usages: true,
              },
            },
            galxeCampaign: true,
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

    console.log(body);

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
        image: body.image,
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
            description: benefit.description,
          })),
        },
        // requirements: {
        //   create: body.requirements.map((requirement) => ({
        //     contractAddress: requirement.contractAddress.toLowerCase(),
        //     network: requirement.network,
        //     minimumHold: requirement.minimumHold,
        //     customConditions: {
        //       create: requirement.customConditions.map((customCondition) => ({
        //         type: customCondition.type,
        //         properties: customCondition as any,
        //       })),
        //     },
        //   })),
        // },
        requirements: {
          create: body.requirements.map((requirement) => {
            if (requirement.type === 'NFT') {
              return {
                type: requirement.type,
                contractAddress: requirement.contractAddress.toLowerCase(),
                network: requirement.network,
                minimumHold: requirement.minimumHold,
                customConditions: {
                  create: requirement.customConditions.map((customCondition) => ({
                    type: customCondition.type,
                    properties: customCondition as any,
                  })),
                },
              };
            } else if (requirement.type === 'OAT') {
              return {
                type: requirement.type,
                galxeCampaignId: requirement.galxeCampaignId,
                minimumHold: requirement.minimumHold,
              };
            }
            return {}; // or throw an error for unsupported type
          }),
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
            description: benefit.description,
          })),
        },
        requirements: {
          deleteMany: {},
          create: body.requirements.map((requirement) => {
            if (requirement.type === 'NFT') {
              return {
                type: requirement.type,
                contractAddress: requirement.contractAddress.toLowerCase(),
                network: requirement.network,
                minimumHold: requirement.minimumHold,
                customConditions: {
                  create: requirement.customConditions.map((customCondition) => ({
                    type: customCondition.type,
                    properties: customCondition as any,
                  })),
                },
              };
            } else if (requirement.type === 'OAT') {
              return {
                type: requirement.type,
                galxeCampaignId: requirement.galxeCampaignId,
                minimumHold: requirement.minimumHold,
              };
            }

            throw new Error('Unsupported requirement type');
          }),
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

export const campaignDeleteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id: userId } = request.user;
    const { id } = request.params as { id: string };

    // get campaign, its id and shop only, and check if the user is the owner
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
        message: 'Unauthorized to delete this campaign',
      });
    }

    const campaign = await prismaClient.merchantCampaign.delete({
      where: {
        id: currCampaign.id,
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

export type CampaignPrisma = Prisma.MerchantCampaignGetPayload<{
  include: {
    requirements: {
      include: {
        nftCollection: true;
        galxeCampaign: true;
      };
    };
  };
}>;

export const campaignClaimHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // const walletAddress = '0x278A2d5B5C8696882d1D2002cE107efc74704ECf';
    const { walletAddress } = request.user;

    const { campaignId, nfts, oats } = request.body as {
      campaignId: string;
      nfts: NftPointer[];
      oats: OatPointer[];
    };

    console.log({
      campaignId,
      nfts,
      oats,
    });

    const campaign = await prismaClient.merchantCampaign.findUnique({
      where: {
        id: campaignId,
      },
      include: {
        requirements: {
          include: {
            nftCollection: true,
            galxeCampaign: true,
          },
        },
      },
    });

    // check campaign quota and user quota
    // if (campaign.totalQuota !== 0 || campaign.perUserQuota !== 0 || campaign.perUserDailyQuota !== 0) {
    //   const currentUsageCount = await prismaClient.merchantCampaignUsage.count({
    //     where: {
    //       campaignId: campaignId,
    //     },
    //   });

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

    const requirementNftPointers = getNftPointersFromCampaignRequirement(campaign.requirements);

    // get all ownerships of nfts and oats from wallet address
    const ownerships = await prismaClient.assetOwnership.findMany({
      where: {
        walletAddress: walletAddress,
        pointer: {
          in: requirementNftPointers,
        },
      },
    });

    // console.log({
    //   requirementNftPointers,
    //   ownerships,
    // });

    if (ownerships.length === 0) {
      return reply.code(400).send({
        code: 'invalid-ownership',
        error: 'Bad Request',
        message: 'Invalid ownership',
      });
    }

    // expiredAT, 5 minutes from now
    const expiredAt = new Date(new Date().getTime() + 5 * 60 * 1000);

    console.log(expiredAt)

    const usage = await prismaClient.merchantCampaignUsage.create({
      data: {
        campaignId: campaignId,
        userId: request.user.id,
        expiredAt: expiredAt
      },
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

    if (usage.userId !== request.user.id) {
      return reply.code(400).send({
        code: 'forbidden',
        error: 'Bad Request',
        message: 'You are not allowed to view this claim detail',
      });
    }

    // if(usage.createdAt < manyMinutesAgo(5)){
    //   return reply.code(400).send({
    //     code: 'invalid-claim',
    //     error: 'Bad Request',
    //     message: 'Claim is expired',
    //   });
    // }

    return reply.code(200).send(usage);
  } catch (error) {
    console.log(error);
  }
};

export const campaignGetTransactionByShopHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.user;
  const { shopId } = request.query as { shopId: string };

  // get current shop and verify if it belongs to the user
  const shop = await prismaClient.merchantShop.findUnique({
    where: {
      id: shopId,
    },
    select: {
      id: true,
      merchantUserId: true,
    },
  });

  if (!shop) {
    return reply.code(400).send({
      code: 'invalid-shop-id',
      error: 'Bad Request',
      message: 'Invalid shop id',
    });
  }

  if (shop.merchantUserId !== id) {
    return reply.code(400).send({
      code: 'unauthorized',
      error: 'Bad Request',
      message: 'Unauthorized to view this shop',
    });
  }

  const transactions = await prismaClient.merchantCampaignUsage.findMany({
    where: {
      campaign: {
        shopId: shopId,
      },
    },
    include: {
      campaign: {
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          requirements: true,
        },
      },
      user: {
        select: {
          id: true,
          walletAddress: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reply.code(200).send(transactions);
};
