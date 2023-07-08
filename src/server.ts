import fastify from 'fastify';
import { Type, TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import config from './plugins/config.js';
import routes from './routes/index.js';
import * as fastifyMultipart from '@fastify/multipart';

const server = fastify({
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
    },
    plugins: [
      fastifyMultipart.ajvFilePlugin
    ]
  },
  logger: {
    level: process.env.LOG_LEVEL,
    transport: {
      target: '@fastify/one-line-logger'
    }
  },
}).withTypeProvider<TypeBoxTypeProvider>();

await server.register(config);

if(process.env.BACKEND_MODE === 'api' || process.env.BACKEND_MODE === 'both'){
  await server.register(routes);
}

await server.ready();
server.swagger();

export default server;
