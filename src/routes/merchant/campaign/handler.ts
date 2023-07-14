import { FastifyRequest, FastifyReply } from 'fastify';
import { prismaClient } from '../../../prisma/index.js';
import { unixToDate } from '../../../utils/dateUtils.js';

export const campaignByShopIdHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { shopId } = request.params as { shopId: string };

    const campaigns = await prismaClient.merchantCampaign.findMany({
      where: {
        shopId: shopId,
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

    console.log(campaigns);

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

    console.log(body.benefits)

    const campaign = await prismaClient.merchantCampaign.create({
      data: {
        name: body.name,
        description: body.description,

        startPeriod: unixToDate(body.startDate),
        endPeriod: unixToDate(body.endDate),
        requirementOperator: body.requirementOperator,

        totalQuota: body.totalQuota,
        perUserQuota: body.perUserQuota,
        perUserDailyQuota: body.perUserDailyQuota,

        shopId: body.shopId,
      },
    });

    for (let i = 0; i < body.benefits.length; i += 1) {
      const benefitItem = body.benefits[i];

      await prismaClient.merchantCampaignBenefit.create({
        data: {
          campaignId: campaign.id,
          type: benefitItem.type,
          value: benefitItem.value,
        },
      });
    }

    for (let i = 0; i < body.requirements.length; i += 1) {
      const requirementItem = body.requirements[i];

      await prismaClient.merchantCampaignRequirement.create({
        data: {
          campaignId: campaign.id,
          contractAddress: requirementItem.contractAddress,
          network: requirementItem.network,
          minimumHold: requirementItem.minimumHold,
          customConditions: {
            createMany: {
              data: requirementItem.customConditions.map((customCondition) => ({
                type: customCondition.type,
                properties: customCondition as any,
              })),
            },
          },
        },
      });
    }

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
        id: id,
      },
      data: {
        name: body.name,
        description: body.description,
        image: body.image,

        startPeriod: unixToDate(body.startDate),
        endPeriod: unixToDate(body.endDate),

        totalQuota: body.totalQuota,
        perUserQuota: body.perUserQuota,
        perUserDailyQuota: body.perUserDailyQuota,

        shopId: body.shopId,
      },
    });

    // replace all benefits
    await prismaClient.merchantCampaignBenefit.deleteMany({
      where: {
        campaignId: campaign.id,
      },
    });

    for (let i = 0; i < body.benefits.length; i += 1) {
      const benefitItem = body.benefits[i];

      await prismaClient.merchantCampaignBenefit.create({
        data: {
          campaignId: campaign.id,
          type: benefitItem.type,
          value: benefitItem.value,
        },
      });
    }

    // replace all requirements
    await prismaClient.merchantCampaignRequirement.deleteMany({
      where: {
        campaignId: campaign.id,
      },
    });

    for (let i = 0; i < body.requirements.length; i += 1) {
      const requirementItem = body.requirements[i];

      await prismaClient.merchantCampaignRequirement.create({
        data: {
          campaignId: campaign.id,
          contractAddress: requirementItem.contractAddress,
          network: requirementItem.network,
          minimumHold: requirementItem.minimumHold,
          customConditions: {
            createMany: {
              data: requirementItem.customConditions.map((customCondition) => ({
                type: customCondition.type,
                properties: customCondition as any,
              })),
            },
          },
        },
      });
    }


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
