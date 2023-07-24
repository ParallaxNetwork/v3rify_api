import { FastifyRequest, FastifyReply } from 'fastify';

import { prismaClient } from '../../../prisma/index.js';
import { getTimeLimitByPeriod } from '../../../utils/dateUtils.js';

export const shopCreateHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { name, address, phoneNumber, email } = request.body as ShopCreateRequest;

    console.log('create shop', request.body);
    const shop = await prismaClient.merchantShop.create({
      data: {
        name: name,
        address: address,
        phoneNumber: phoneNumber,
        email: email,
        merchantUserId: request.user.id,
      },
    });

    return reply.code(200).send({
      id: shop.id,
    });
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const shopGetMyShopsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const shops = await prismaClient.merchantShop.findFirst({
      where: {
        merchantUserId: request.user.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    console.log('shops', shops);

    return reply.code(200).send([shops]);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const shopGetShopByIdHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as {
      id: string;
    };
    const shop = await prismaClient.merchantShop.findUnique({
      where: {
        id: id,
      },
    });

    if (!shop) {
      return reply.code(404).send({
        code: 'not-found',
        error: 'not-found',
        message: 'Shop not found',
      });
    }

    return reply.code(200).send(shop);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const shopUpdateShopByIdHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as {
      id: string;
    };
    const updateData = request.body as ShopCreateRequest;

    const shop = await prismaClient.merchantShop.findUnique({
      where: {
        id: id,
      },
    });

    if (!shop) {
      return reply.code(404).send({
        code: 'not-found',
        error: 'not-found',
        message: 'Not found',
      });
    }

    // validate if the shop belongs to the user
    if (shop.merchantUserId !== request.user.id) {
      return reply.code(403).send({
        code: 'forbidden',
        error: 'forbidden',
        message: 'Forbidden',
      });
    }

    const updatedShop = await prismaClient.merchantShop.update({
      where: {
        id: id,
      },
      data: {
        ...shop,
        ...updateData,
      },
    });

    return reply.code(200).send(updatedShop);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const shopGetAnalyticsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { shopId } = request.query as {
      shopId: string;
    };

    const allTransactions = await prismaClient.merchantCampaignUsage.findMany({
      where: {
        campaign: {
          shopId: shopId,
        },
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            walletAddress: true,
          },
        },
      },
    });

    const totalTransaction = allTransactions.length;
    const totalAddressClaimed = new Set(allTransactions.map((transaction) => transaction.user.walletAddress)).size;

    const analytics: ShopAnalytics = {
      totalClaimed: {
        total: totalTransaction,
        periodicTotal: [
          {
            value: 'today',
            total: allTransactions.filter((transaction) => transaction.createdAt > getTimeLimitByPeriod('today'))
              .length,
          },
          {
            value: 'week',
            total: allTransactions.filter((transaction) => transaction.createdAt > getTimeLimitByPeriod('week')).length,
          },
          {
            value: 'month',
            total: allTransactions.filter((transaction) => transaction.createdAt > getTimeLimitByPeriod('month'))
              .length,
          },
          {
            value: 'year',
            total: allTransactions.filter((transaction) => transaction.createdAt > getTimeLimitByPeriod('year')).length,
          },
        ],
        totalAddressClaimed: totalAddressClaimed,
      },
    };

    return reply.code(200).send(analytics);
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};
