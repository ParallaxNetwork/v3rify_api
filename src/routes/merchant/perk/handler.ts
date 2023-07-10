import { FastifyRequest, FastifyReply } from 'fastify';

import { prismaClient } from '../../../prisma/index.js';
import { PerkCreateRequest } from '../../../@types/Perk.js';

export const perkCreateHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { name } = request.body as PerkCreateRequest;

    reply.code(200).send({
      id: '123',
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
