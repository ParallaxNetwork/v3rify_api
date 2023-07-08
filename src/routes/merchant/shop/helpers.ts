import { FastifyReply, FastifyRequest } from 'fastify';
import validator from 'validator';

export const validateCreateShopRequest = (request: FastifyRequest, reply: FastifyReply, next: any) => {
  const { name, address, phoneNumber, email } = request.body as ShopCreateRequest;
  if (!name || !address || !phoneNumber || !email) {
    return reply.code(400).send('Name, address, phoneNumber, email are required');
  }

  if (name.length > 50 || name.length < 3) {
    return reply.code(400).send({
      code: 'invalid-name',
      error: 'invalid-name',
      message: 'Invalid name',
    });
  }

  if (address.length > 200) {
    return reply.code(400).send({
      code: 'invalid-address',
      error: 'invalid-address',
      message: 'Invalid address',
    });
  }

  if (!validator.isMobilePhone(phoneNumber, 'any')) {
    return reply.code(400).send({
      code: 'invalid-phone-number',
      error: 'invalid-phone-number',
      message: 'Invalid phone number',
    });
  }

  if (!validator.isEmail(email)) {
    return reply.code(400).send({
      code: 'invalid-email',
      error: 'invalid-email',
      message: 'Invalid email',
    });
  }

  next();
};
