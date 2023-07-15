import { FastifyRequest, FastifyReply } from 'fastify';
import { prismaClient } from '../../../prisma/index.js';
import { unixToDate } from '../../../utils/dateUtils.js';

export const campaignGetHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { isActive, shopId } = request.query as { isActive: boolean, shopId: string };


    const campaigns = await prismaClient.merchantCampaign.findMany({
      where: {
        shopId: shopId,
        isActive: isActive
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
              }
            }
          }
        },
        shop: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
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
          }))
        },
        requirements: {
          create: body.requirements.map((requirement) => ({
            contractAddress: requirement.contractAddress,
            network: requirement.network,
            minimumHold: requirement.minimumHold,
            customConditions: {
              create: requirement.customConditions.map((customCondition) => ({
                type: customCondition.type,
                properties: customCondition as any, 
              }))
            }
          }))
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
          // deleteMany: {}, // Delete all existing requirements
          create: body.requirements.map((requirement) => ({
            contractAddress: requirement.contractAddress,
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
