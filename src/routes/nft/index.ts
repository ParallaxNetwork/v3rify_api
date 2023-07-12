import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { isAddress } from 'web3-validator';

import { ErrorSchema } from '../../typebox/common.js';
import { authenticate } from '../../middleware/auth.js';
import { alchemyClient } from '../../utils/alchemy/index.js';
import { prismaClient } from '../../prisma/index.js';
import { manyMinutesAgo } from '../../utils/dateUtils.js';

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
    async (request, reply) => {
      try {
        const { id, chain } = request.query as { id: string; chain: 'ethereum' | 'matic' };

        // find collection metadata
        const existing = await prismaClient.nftCollection.findUnique({
          where: {
            address_chain: {
              address: id,
              chain: chain,
            },
          },
        });

        if (existing) {
          // if data is updated within 15 minutes, return existing
          if (existing.updatedAt > manyMinutesAgo(15)) {
            return reply.code(200).send(existing);
          }
        }

        const collectionMetadata = await alchemyClient(chain).nft.getContractMetadata(id);
        if(collectionMetadata.tokenType !== 'ERC721') {
          return reply.code(400).send({
            code: 'invalid_collection',
            error: 'Bad Request',
            message: 'Invalid collection',
          });
        }

        const collectionAttributesSummary = await alchemyClient(chain).nft.summarizeNftAttributes(id);

        const metadata = await prismaClient.nftCollection.upsert({
          where: {
            address_chain: {
              address: id,
              chain: chain,
            },
          },
          create: {
            address: id,
            name: collectionMetadata.name,
            symbol: collectionMetadata.symbol,
            tokenType: collectionMetadata.tokenType,
            chain: chain,
            opensea: { ...collectionMetadata.openSea },
            description: collectionMetadata.openSea.description,
            image: collectionMetadata.openSea.imageUrl,
            rarity: { ...collectionAttributesSummary },
          },
          update: {
            name: collectionMetadata.name,
            symbol: collectionMetadata.symbol,
            opensea: { ...collectionMetadata.openSea },
            description: collectionMetadata.openSea.description,
            image: collectionMetadata.openSea.imageUrl,
            rarity: { ...collectionAttributesSummary },
          },
        });

        return reply.code(200).send(metadata);
      } catch (error) {
        console.log(error);
        reply.code(500).send({
          code: 'internal_server_error',
          error: 'Internal Server Error',
          message: 'Something went wrong',
        });
      }
    },
  );
};

export default nftRoutes;
