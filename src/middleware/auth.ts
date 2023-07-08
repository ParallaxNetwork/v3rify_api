import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';

import { prismaClient } from '../prisma/index.js';
import { DecodedToken } from '../@types/Auth.js';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticate = async (request: FastifyRequest, reply: FastifyReply, role: string | null) => {
  try {
    const { authorization } = request.headers as {
      authorization: string;
    };

    if (!authorization) {
      return reply.code(401).send({
        code: 'unauthorized',
        error: 'unauthorized',
        message: "No authorization header provided"
      });
    }

    try {
      const decoded = jwt.verify(authorization, JWT_SECRET) as DecodedToken;
      request.user = decoded;

      if (role) {
        const userRole = await prismaClient.userRole.findFirst({
          where: {
            userId: decoded.id,
          },
        });

        if (!userRole) {
          return reply.code(401).send({
            code: 'unauthorized',
            error: 'unauthorized',
            message: "unauthorized"
          });
        }
      }
    } catch (error) {
      return reply.code(401).send({
        code: 'unauthorized',
        error: 'unauthorized',
        message: "unauthorized"
      });
    }
  } catch (error) {
    console.log(error);
    return reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};
