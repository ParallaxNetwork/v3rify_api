import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import authRoutes from './auth/index.js';
import merchantRoutes from './merchant/index.js';
import uploadRoutes from './upload/index.js';
import nftRoutes from './nft/index.js';

const routes: FastifyPluginAsync = async (server) => {
  server.register(authRoutes, { prefix: '/auth' });
  server.register(merchantRoutes, { prefix: '/merchant' });
  server.register(uploadRoutes, { prefix: '/upload' });
  server.register(nftRoutes, { prefix: '/nft' });

  server.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Object({
            hello: Type.String(),
          }),
        },
        security: [
          {
            apiKey: [],
          },
        ],
      },
    },
    async function () {
      return { hello: 'bro' };
    },
  );
};

export default routes;
