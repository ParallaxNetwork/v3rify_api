import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import shopRoutes from './shop/index.js';
import perkRoutes from './perk/index.js';

const merchantRoutes: FastifyPluginAsync = async (server) => {
  server.register(shopRoutes, { prefix: '/shop' });
  server.register(perkRoutes, { prefix: '/perk' });
}

export default merchantRoutes;