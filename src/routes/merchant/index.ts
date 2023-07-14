import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import shopRoutes from './shop/index.js';
import campaignRoutes from './campaign/index.js';

const merchantRoutes: FastifyPluginAsync = async (server) => {
  server.register(shopRoutes, { prefix: '/shop' });
  server.register(campaignRoutes, { prefix: '/campaign' });
}

export default merchantRoutes;