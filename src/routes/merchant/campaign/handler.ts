import { FastifyRequest, FastifyReply } from 'fastify';
import { prismaClient } from '../../../prisma/index.js';
import { unixToDate } from '../../../utils/dateUtils.js';

export const campaignCreateHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = request.body as CampaignCreateRequest

    console.log(body.shopId)

    const campaign = await prismaClient.merchantCampaign.create({
      data: {
        name: body.name,
        description: body.description,

        startPeriod: unixToDate(body.startDate),
        endPeriod: unixToDate(body.endDate),

        totalQuota: body.totalQuota,
        perUserQuota: body.perUserQuota,
        perUserDailyQuota: body.perUserDailyQuota,

        shopId: body.shopId,
      }
    })

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
  try{
    const body = request.body as Partial<CampaignCreateRequest>
    const { id } = request.params as { id: string }

    console.log(body)

    const campaign = await prismaClient.merchantCampaign.update({
      where: {
        id: id
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
      }
    })

    reply.code(200).send(campaign);
  }catch(error){
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
}
