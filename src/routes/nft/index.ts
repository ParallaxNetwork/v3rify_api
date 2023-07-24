import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { isAddress } from 'web3-validator';

import { ErrorSchema } from '../../typebox/common.js';
import { authenticate } from '../../middleware/auth.js';
import { alchemyClient } from '../../utils/alchemy/index.js';
import { prismaClient } from '../../prisma/index.js';
import { manyMinutesAgo } from '../../utils/dateUtils.js';
import { infuraGetAllNfts, summarizeNftAttributes } from './helpers.js';
import { nftGetCollectionMetadataHandler, nftGetOATMetadataHandler, nftGetOwnedNftsHandler, nftGetOwnerOatsHandler } from './handler.js';
import { InfuraAssetsModelType } from '../../typebox/Infura.js';
import { GalxeCampaignType, GalxeOATItemType } from '../../typebox/Galxe.js';

const nftRoutes: FastifyPluginAsync = async (server) => {
  server.get(
    '/collection-metadata',
    {
      schema: {
        querystring: Type.Object({
          id: Type.String({
            description: 'The contract address of the nft collection',
            default: '0xCb2411C2B914b000aD13c86027222A797983EF2D',
          }),
          chain: Type.String({
            description: 'The chain name of the nft collection',
            default: 'ethereum',
          }),
        }),
        response: {
          200: Type.Object({
            address: Type.String(),
            name: Type.String(),
            symbol: Type.String(),
            tokenType: Type.String(),
            chain: Type.String(),
            description: Type.String(),
            image: Type.String(),
            opensea: Type.Any(),
            rarity: Type.Any(),
          }),
          400: ErrorSchema,
        },
        tags: ['nft'],
        summary: 'Get NFT collection metadata',
        description: 'Get NFT collection metadata',
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
          const { id, chain } = request.query as { id: string; chain: string };

          // check address is valid
          if (!isAddress(id)) {
            reply.code(400).send({
              code: 'invalid_address',
              error: 'Bad Request',
              message: 'Invalid address',
            });
          }

          // check chain id is valid
          if (chain !== 'ethereum' && chain !== 'matic') {
            reply.code(400).send({
              code: 'invalid_chain',
              error: 'Bad Request',
              message: 'Invalid chain',
            });
          }
        },
      ],
    },
    nftGetCollectionMetadataHandler
  );

  server.get(
    '/oat-metadata',
    {
      schema: {
        querystring: Type.Object({
          campaignId: Type.String({
            description: 'The campaign id of the OAT',
            default: 'GCWGWUSsXF',
          }),
        }),
        response: {
          200: GalxeCampaignType,
          400: ErrorSchema,
        },
        tags: ['nft'],
        summary: 'Get Galxe OAT metadata',
        description: 'Get Galxe OAT metadata',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    nftGetOATMetadataHandler
  )

  server.get(
    '/owned-nfts',
    {
      schema: {
        querystring: Type.Object({
          address: Type.String({
            description: 'The address of the wallet',
            default: '0x278A2d5B5C8696882d1D2002cE107efc74704ECf',
          })
        }),
        response: {
          200: Type.Array(InfuraAssetsModelType),
          400: ErrorSchema,
        },
        tags: ['nft'],
        summary: 'Get owned NFTs',
        description: 'Get owned NFTs',
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
          const { address } = request.query as { address: string; chain: string };

          // check address is valid
          if (!isAddress(address)) {
            reply.code(400).send({
              code: 'invalid_address',
              error: 'Bad Request',
              message: 'Invalid address',
            });
          }
        }
      ]
    },
    nftGetOwnedNftsHandler
  )

  server.get(
    '/owned-oats',
    {
      schema: {
        querystring: Type.Object({
          address: Type.String({
            description: 'The address of the wallet',
            default: '0x278A2d5B5C8696882d1D2002cE107efc74704ECf',
          })
        }),
        response: {
          200: Type.Array(GalxeOATItemType),
          400: ErrorSchema,
        },
        tags: ['nft'],
        summary: 'Get owned OATs',
        description: 'Get owned OATs',
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
          const { address } = request.query as { address: string; chain: string };

          // check address is valid
          if (!isAddress(address)) {
            reply.code(400).send({
              code: 'invalid_address',
              error: 'Bad Request',
              message: 'Invalid address',
            });
          }
        }
      ]
    },
    nftGetOwnerOatsHandler
  )
};

export default nftRoutes;
