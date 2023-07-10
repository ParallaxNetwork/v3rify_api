import 'dotenv/config';
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import Ajv from 'ajv';

// Fastify Plugins
import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { FASTIFY_SWAGGER_PLUGIN_CONFIG, FASTIFY_SWAGGER_UI_PLUGIN_CONFIG } from './constants.js';

export enum NodeEnv {
  development = 'development',
  test = 'test',
  production = 'production',
}

export enum BackendMode {
  api = 'api',
  worker = 'worker',
  both = 'both'
}

const ConfigSchema = Type.Strict(
  Type.Object({
    NODE_ENV: Type.Enum(NodeEnv),
    LOG_LEVEL: Type.String(),
    API_HOST: Type.String(),
    API_PORT: Type.String(),
    BACKEND_MODE: Type.String(),
    JWT_SECRET: Type.String(),
    // S3 Config
    S3_ENDPOINT: Type.String(),
    S3_ACCESS_KEY_ID: Type.String(),
    S3_SECRET_ACCESS_KEY: Type.String(),
    S3_BUCKET_NAME: Type.String(),
    S3_BUCKET_REGION: Type.String(),
    // API Key
    ALCHEMY_API_KEY: Type.String(),
  }),
);

const ajv = new Ajv({
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  allowUnionTypes: true,
});

export type Config = Static<typeof ConfigSchema>;

const configPlugin: FastifyPluginAsync = async (server) => {
  const validate = ajv.compile(ConfigSchema);
  const valid = validate(process.env);
  if (!valid) {
    throw new Error('.env file validation failed - ' + JSON.stringify(validate.errors, null, 2));
  }

  if(process.env.BACKEND_MODE === BackendMode.api || process.env.BACKEND_MODE === BackendMode.both){
    await server.register(fastifyCors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
  
    await server.register(fastifyFormbody);
  
    await server.register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'v3rify.io'", "https: 'unsafe-inline'"],
        },
      },
    });
  
    await server.register(fastifyMultipart, {
      limits: {
        fileSize: 1024 * 1024 * 10,
      },
      attachFieldsToBody: true
    });
  
    await server.register(fastifySwagger, FASTIFY_SWAGGER_PLUGIN_CONFIG);
    await server.register(fastifySwaggerUi, FASTIFY_SWAGGER_UI_PLUGIN_CONFIG);
  }

  server.decorate('config', process.env as Config);
};

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
}

export default fp(configPlugin);
