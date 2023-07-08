import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  merchantCheckUsernameHandler,
  merchantMeHandler,
  merchantRegisterHandler,
  merchantUsernameLoginHandler,
  merchantWalletLoginHandler,
  nonceHandler,
} from './handler.js';
import { validateAddress } from '../../utils/web3/web3ValidationUtil.js';
import { checkMerchantWhitelist } from '../../middleware/whitelist.js';
import { ErrorSchema, ShopType } from '../../typebox/common.js';
import { authenticate } from '../../middleware/auth.js';
import { UsernameLoginRequest, WalletLoginRequest } from '../../@types/Auth.js';

const authRoutes: FastifyPluginAsync = async (server) => {
  server.get(
    '/nonce',
    {
      schema: {
        response: {
          200: Type.String(),
          400: ErrorSchema,
        },
        tags: ['auth'],
        summary: 'Get nonce',
        description: 'Get nonce',
        produces: ['application/json'],
      },
    },
    nonceHandler,
  );

  /* ------------------------- Register a new merchant ------------------------ */
  server.post(
    '/merchant/register',
    {
      schema: {
        body: Type.Object(
          {
            type: Type.Union([Type.Literal('username')], {
              description: 'The type of the merchant, currently only username is supported',
              default: 'username',
            }),
            username: Type.Optional(
              Type.String({
                description:
                  'The username of the merchant, must be 5-25 characters long, only alphanumeric characters with underscores or dashes are allowed',
                default: 'testing_merchant',
                minLength: 5,
                maxLength: 25,
                pattern: '^[a-zA-Z0-9_-]*$',
              }),
            ),
            password: Type.Optional(
              Type.String({
                description: 'The password of the merchant',
                default: 'testing_merchant_password',
                minLength: 8,
              }),
            ),
          },
          {
            required: ['type', 'username', 'password'],
          },
        ),
        response: {
          200: Type.Object(
            {
              id: Type.String(),
              type: Type.Literal('username'),
              token: Type.String(),
            },
            {
              description: 'Returns the id and type of the newly created merchant',
              default: {
                id: '1',
                type: 'username',
                token: 'token',
              },
            },
          ),
          400: ErrorSchema,
        },
        tags: ['auth'],
        summary: 'Register a new user',
        description:
          "Register a new user, the type can be either 'username' or 'wallet'\n\nIf the type is 'username' then the username and password fields are required",
        produces: ['application/json'],
      },
      preValidation: [
        async function (request: FastifyRequest, reply: FastifyReply) {
          const { type, username, password } = request.body as MerchantRegisterRequest;

          if (type !== 'username') {
            reply.code(400).send({
              code: 'invalid-type',
              error: 'invalid-type',
              message: 'Invalid type',
            });
          }

          if (type === 'username' && (!username || !password)) {
            reply.code(400).send({
              code: 'invalid-username-or-password',
              error: 'invalid-username-or-password',
              message: 'Invalid username or password',
            });
          }
        },
      ],
      preHandler: [(request, reply) => checkMerchantWhitelist('username', request, reply)],
    },
    merchantRegisterHandler,
  );

  /* --------------------- Check if username is available --------------------- */
  server.get(
    '/merchant/username-available',
    {
      schema: {
        querystring: Type.Object(
          {
            username: Type.String(),
          },
          {
            required: ['username'],
          },
        ),
        response: {
          200: Type.Boolean(),
          400: ErrorSchema,
        },
        tags: ['auth'],
        summary: 'Check if username is available',
        description: 'Check if username is available, returns true if available, false if not',
        produces: ['application/json'],
      },
      preValidation: [
        async function (request: FastifyRequest, reply) {
          const { username } = request.query as {
            username: string;
          };

          if (!username) {
            reply.code(400).send({
              code: 'invalid-username',
              error: 'invalid-username',
              message: 'Username is required',
            });
          }
        },
      ],
    },
    merchantCheckUsernameHandler,
  );

  /* ----------------------------- Username Login ----------------------------- */
  server.post(
    '/merchant/username-login',
    {
      schema: {
        body: Type.Object(
          {
            username: Type.String({
              description: 'The username of the merchant',
              default: 'testing_merchant',
              minLength: 5,
              maxLength: 25,
            }),
            password: Type.String({
              description: 'The password of the merchant',
              default: 'testing_merchant_password',
            }),
          },
          {
            required: ['username', 'password'],
          },
        ),
        response: {
          200: Type.Object({
            id: Type.String(),
            token: Type.String(),
            type: Type.Literal('username'),
          }),
          400: ErrorSchema,
        },
        tags: ['auth'],
        summary: 'Login with a username',
        description: 'Login with a username',
        produces: ['application/json'],
      },
      preValidation: [
        async function (request: FastifyRequest, reply: FastifyReply) {
          const { username, password } = request.body as UsernameLoginRequest;
          if (!username || !password) {
            reply.code(400).send({
              code: 'invalid-username-or-password',
              error: 'invalid-username-or-password',
              message: 'Username and password are required',
            });
          }
        },
      ],
    },
    merchantUsernameLoginHandler,
  );

  /* ------------------------------ Wallet Login ------------------------------ */
  server.post(
    '/merchant/wallet-login',
    {
      schema: {
        body: Type.Object({
          signature: Type.String(),
          address: Type.String(),
          // message is siwe object
          message: Type.Any(),
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            token: Type.String(),
            type: Type.Literal('wallet'),
          }),
          400: ErrorSchema,
        },
        tags: ['auth'],
        summary: 'Login with a wallet',
        description: 'Login with a wallet',
        produces: ['application/json'],
      },
      preValidation: [
        async function (request: FastifyRequest, reply: FastifyReply) {
          const { signature, address, message } = request.body as WalletLoginRequest;
          if (!signature || !address || !message) {
            reply.code(400).send({
              code: 'missing-fields',
              error: 'Missing fields',
              message: 'Missing fields',
            });
          }

          if (!validateAddress(address)) {
            reply.code(400).send({
              code: 'invalid-address',
              error: 'Invalid address',
              message: 'Invalid address',
            });
          }
        },
      ],
      preHandler: [(request, reply) => checkMerchantWhitelist('wallet', request, reply)],
    },
    merchantWalletLoginHandler,
  );

  server.get(
    '/merchant/me',
    {
      schema: {
        response: {
          200: Type.Object({
            id: Type.String(),
            type: Type.String(),
            username: Type.String(),
            walletAddress: Type.String(),
            shops: Type.Array(ShopType),
          }),
          401: ErrorSchema,
        },
        tags: ['auth'],
        summary: 'Get the current merchant',
        description: 'Get the current merchant',
        produces: ['application/json'],
        security: [{ apiKey: [] }],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    merchantMeHandler,
  );
};

export default authRoutes;
