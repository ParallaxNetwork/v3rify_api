import { SwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

const FASTIFY_SWAGGER_PLUGIN_CONFIG: SwaggerOptions = {
  swagger: {
    info: {
      title: 'V3rify API',
      description: 'V3rify API Documentation',
      version: '1.0.0',
    },
    swagger: '2.2',
    host: `${process.env.BASE_URL}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'auth', description: 'Authentication related end-points' },
      { name: 'merchant', description: 'Merchant related end-points' },
      { name: 'users', description: 'Users related end-points' },
      { name: 'default', description: 'Hello Bro' },
    ],
    securityDefinitions: {
      apiKey: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
};

const FASTIFY_SWAGGER_UI_PLUGIN_CONFIG: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
    tryItOutEnabled: true,
    persistAuthorization: true,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      console.log('onRequest');
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
};


export { FASTIFY_SWAGGER_PLUGIN_CONFIG, FASTIFY_SWAGGER_UI_PLUGIN_CONFIG };