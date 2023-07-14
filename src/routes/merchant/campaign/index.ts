import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import { authenticate } from '../../../middleware/auth.js';
import { ErrorSchema } from '../../../typebox/common.js';
import { campaignByShopIdHandler, campaignCreateHandler, campaignUpdateHandler } from './handler.js';
import { CampaignCreateRequestSchema, CampaignSchema } from '../../../typebox/Campaign.js';

const campaignRoutes: FastifyPluginAsync = async (server) => {
  server.get(
    '/:shopId',
    {
      schema: {
        response: {
          200: Type.Array(Type.Any()),
          400: ErrorSchema,
        },
        params: Type.Object({
          shopId: Type.String(),
        }),
        tags: ['campaign'],
        summary: 'Get all campaigns from a merchant',
        description: 'Get all campaigns from a merchant',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preValidation: [
        async function (request: FastifyRequest, reply: FastifyReply) {
          const { shopId } = request.params as { shopId: string };
          if (!shopId) {
            reply.code(400).send({
              code: 'missing-fields',
              error: 'Missing fields',
              message: 'Missing fields',
            });
          }
        }
      ]
    },
    campaignByShopIdHandler
  )

  server.post(
    '/create',
    {
      schema: {
        body: CampaignCreateRequestSchema,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          400: ErrorSchema,
        },
        tags: ['campaign'],
        summary: 'Create a new campaign',
        description: 'Create a new campaign',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    campaignCreateHandler,
  );

  server.put(
    '/:id',
    {
      schema: {
        body: CampaignCreateRequestSchema,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          400: ErrorSchema,
        },
        tags: ['campaign'],
        summary: 'Edit a Campaign',
        description: 'Edit a Campaign',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    campaignUpdateHandler
  )
};

export default campaignRoutes;
