import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import { authenticate } from '../../../middleware/auth.js';
import { ErrorSchema, PerkCreateRequestType } from '../../../typebox/common.js';
import { perkCreateHandler } from './handler.js';

const perkRoutes: FastifyPluginAsync = async (server) => {
  server.post(
    '/create',
    {
      schema: {
        body: PerkCreateRequestType,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          400: ErrorSchema,
        },
        tags: ['perk'],
        summary: 'Create a new perk',
        description: 'Create a new perk',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
      preValidation: [
        async function (request: FastifyRequest, reply: FastifyReply) {
          const { requirementOperator } = request.body as { requirementOperator: string };
          if(['and', 'or'].indexOf(requirementOperator) === -1) {
            reply.code(400).send({
              code: 'invalid_requirement_operator',
              error: 'Bad Request',
              message: 'Invalid requirement operator',
            });
          } 
        }
      ]
    },
    perkCreateHandler,
  );
};

export default perkRoutes;