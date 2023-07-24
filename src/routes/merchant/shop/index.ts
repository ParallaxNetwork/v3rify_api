import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import { authenticate } from '../../../middleware/auth.js';
import {
  shopCreateHandler,
  shopGetAnalyticsHandler,
  shopGetMyShopsHandler,
  shopGetShopByIdHandler,
  shopUpdateShopByIdHandler,
} from './handler.js';
import { validateCreateShopRequest } from './helpers.js';
import { ErrorSchema, ShopType } from '../../../typebox/common.js';
import { ShopAnalyticsResponseSchema } from '../../../typebox/Shop.js';

const shopRoutes: FastifyPluginAsync = async (server) => {
  server.post(
    '/new',
    {
      schema: {
        body: Type.Object(
          {
            name: Type.String({
              description: 'The name of the shop',
              default: 'testing_shop',
            }),
            address: Type.String({
              description: 'The address of the shop',
              default: 'testing_shop_address',
            }),
            phoneNumber: Type.String({
              description: 'The phone number of the shop',
              default: '+6281234567890',
            }),
            email: Type.String({
              description: 'The email of the shop',
              default: 'testing_shop_email@gmail.com',
            }),
          },
          {
            required: ['name', 'address', 'phoneNumber', 'email'],
            description: 'Create a new shop for a merchant',
          },
        ),
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
          400: ErrorSchema,
        },
        tags: ['merchant'],
        summary: 'Create a new shop',
        description: 'Create a new shop',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preValidation: [validateCreateShopRequest],
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    shopCreateHandler,
  );

  server.get(
    '/my-shops',
    {
      schema: {
        response: {
          200: Type.Array(ShopType, {
            description: 'List of shops owned by a merchant',
          }),
          400: ErrorSchema,
        },
        tags: ['merchant'],
        summary: 'Get list of shops owned by a merchant',
        description: 'Get list of shops owned by a merchant by its token',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    shopGetMyShopsHandler,
  );

  server.get(
    '/:id',
    {
      schema: {
        params: Type.Object(
          {
            id: Type.String({}),
          },
          {
            required: ['id'],
            description: 'Get a shop by its id',
          },
        ),
        response: {
          200: ShopType,
          400: ErrorSchema,
        },
        tags: ['merchant'],
        summary: 'Get a shop by its id',
        description: 'Get a shop by its id',
        produces: ['application/json'],
      },
      preValidation: [
        async function (request: FastifyRequest, reply: FastifyReply) {
          console.log('request.params', request.params);
          const { id } = request.params as { id: string };
          if (!id) {
            return reply.code(400).send({
              code: 'invalid_id',
              error: 'Invalid id',
              message: 'Id is required',
            });
          }
        },
      ],
    },
    shopGetShopByIdHandler,
  );

  const ShopUpdateType = Type.Object(
    {
      name: Type.String(),
      description: Type.Optional(Type.String()),
      address: Type.String(),
      phoneNumber: Type.String(),
      email: Type.String(),
      image: Type.Optional(Type.String()),
    },
    {
      description: 'Shop',
    },
  );

  server.put(
    '/:id',
    {
      schema: {
        params: Type.Object(
          {
            id: Type.String({}),
          },
          {
            required: ['id'],
            description: 'Update a shop by its id',
          },
        ),
        body: ShopUpdateType,
        response: {
          200: ShopType,
          400: ErrorSchema,
        },
        tags: ['merchant'],
        summary: 'Update a shop by its id',
        description: 'Update a shop by its id',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preValidation: [validateCreateShopRequest],
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    shopUpdateShopByIdHandler,
  );

  server.get(
    '/analytics',
    {
      schema: {
        querystring: Type.Object({
          shopId: Type.String({
            description: 'The id of the shop',
            default: 'testing_shop',
          }),
        }),
        response: {
          200: ShopAnalyticsResponseSchema,
          400: ErrorSchema,
        },
        tags: ['merchant'],
        summary: 'Get analytics of a shop by its id',
        description: 'Get analytics of a shop by its id',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    shopGetAnalyticsHandler,
  );
};

export default shopRoutes;
