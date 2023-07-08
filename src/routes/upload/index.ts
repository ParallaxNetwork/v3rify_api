import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import { ErrorSchema, ShopType } from '../../typebox/common.js';
import { authenticate } from '../../middleware/auth.js';
import { uploadFileToBucket } from '../../utils/s3/fileBucket.js';
import { prismaClient } from '../../prisma/index.js';
import { MultipartFile } from '@fastify/multipart';

const UploadSchema = Type.Object({
  targetId: Type.Any(),
  type: Type.Any(),
  file: Type.Any(),
});

const uploadRoutes: FastifyPluginAsync = async (server) => {
  server.post(
    '',
    {
      schema: {
        consumes: ['multipart/form-data'],
        body: UploadSchema,
        response: {
          200: Type.String({
            description: 'Link to the image',
            default: 'https://picsum.photos/200',
          }),
          400: ErrorSchema,
        },
        tags: ['upload'],
        summary: 'Upload an shop image',
        description: 'Upload an shop image',
        produces: ['application/json'],
        security: [
          {
            apiKey: [],
          },
        ],
      },
      preHandler: [async (request, reply) => authenticate(request, reply, null)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const uploadType = ['shop-image'];
        // access form data

        const { targetId: _targetId, type: _type, file } = request.body as { targetId: any; type: any; file: MultipartFile };
        const targetId = _targetId.value
        const type = _type.value

        if (!file) {
          reply.code(400).send({
            code: 'invalid-file',
            error: 'Bad Request',
            message: 'Invalid file',
          });
        }

        /* ------------------------------- Shop image ------------------------------- */
        if (type === 'shop-image') {
          const shop = await prismaClient.merchantShop.findUnique({
            where: {
              id: targetId
            },
          });

          console.log('shop', shop);

          if (!shop) {
            reply.code(400).send({
              code: 'invalid-target-id',
              error: 'Bad Request',
              message: 'Invalid target id',
            });
          }

          if (shop.merchantUserId !== request.user.id) {
            reply.code(400).send({
              code: 'unauthorized',
              error: 'Bad Request',
              message: 'Unauthorized to upload image for this shop',
            });
          }

          const fileExtension = file.mimetype.split('/')[1];
          console.log('fileExtension', fileExtension);

          const fileUrl = await uploadFileToBucket({
            file: await file.toBuffer(),
            path: `shop/${targetId}/shop_image.${fileExtension}`,
            acl: 'public-read',
            type: 'image-shop',
            userId: request.user.id,
          });

          console.log('fileUrl', fileUrl);

          return reply.status(200).send(fileUrl);
        }

        reply.code(400).send({
          code: 'invalid-upload-type',
          error: 'Bad Request',
          message: 'Invalid upload type',
        });
      } catch (error) {
        console.log('error', error);
        reply.status(500).send({
          code: 'internal-server-error',
          error: 'Internal Server Error',
          message: 'Something went wrong',
        });
      }
    },
  );
};

export default uploadRoutes;
