import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import shopRoutes from './shop/index.js';

const merchantRoutes: FastifyPluginAsync = async (server) => {
  server.register(shopRoutes, { prefix: '/shop' });
}

export default merchantRoutes;