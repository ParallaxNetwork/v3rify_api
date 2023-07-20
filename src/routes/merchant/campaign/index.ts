import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import { authenticate } from '../../../middleware/auth.js';
import { ErrorSchema } from '../../../typebox/common.js';
import { campaignClaimHandler, campaignCreateHandler, campaignGetClaimDetailHandler, campaignGetHandler, campaignUpdateHandler } from './handler.js';
import { CampaignCreateRequestSchema, CampaignSchema, ClaimResponseSchema } from '../../../typebox/Campaign.js';

const campaignRoutes: FastifyPluginAsync = async (server) => {
  server.get(
    '',
    {
      schema: {
        response: {
          200: Type.Array(Type.Any()),
          400: ErrorSchema,
        },
        querystring: {
          shopId: Type.Optional(
            Type.String({
              default: undefined,
            }),
          ),
          isActive: Type.Optional(
            Type.Boolean({
              default: undefined,
            }),
          ),
          id: Type.Optional(
            Type.String({
              default: undefined,
            }),
          ),
          withDetails: Type.Optional(
            Type.Boolean({
              default: undefined,
            }),
          ),
        },
        tags: ['campaign'],
        summary: 'Get campaigns',
        description: 'Get campaigns with filter',
        produces: ['application/json'],
      },
    },
    campaignGetHandler,
  );

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
    campaignUpdateHandler,
  );


  server.post(
    '/claim',
    {
      schema: {
        body: Type.Object({
          campaignId: Type.String(),  
          nfts: Type.Array(Type.Object({
            address: Type.String(),
            chainId: Type.Number(),
            tokenId: Type.String(),
          }))
        }),
        response: {
          200: Type.String(),
          400: ErrorSchema,
        },
        tags: ['campaign'],
        summary: 'Claim a Campaign',
        description: 'Claim a Campaign',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          }
        ],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    campaignClaimHandler
  )

  server.get(
    '/claim/:claimId',
    {
      schema: {
        response: {
          200: ClaimResponseSchema,
          400: ErrorSchema,
        },
        params: Type.Object({
          claimId: Type.String(),
        }),
        tags: ['campaign'],
        summary: 'Get a Claim detail',
        description: 'Get a Claim detail',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          }
        ],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    campaignGetClaimDetailHandler
  )
};

export default campaignRoutes;
