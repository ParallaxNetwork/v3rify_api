import { FastifyRequest, FastifyReply } from 'fastify';
import { prismaClient } from '../prisma/index.js';

export const checkMerchantWhitelist = async (type: string, request: FastifyRequest, reply: FastifyReply) => {
  // if (type === 'username') {
  //   const { username } = request.body as MerchantRegisterRequest;
  //   const findMerchantWhitelist = await prismaClient.merchantWhitelist.findFirst({
  //     where: {
  //       value: username,
  //       type: 'username'
  //     }
  //   })

  //   if(!findMerchantWhitelist) {
  //     return reply.code(403).send({
  //       code: 'username-not-whitelisted',
  //       error: 'username-not-whitelisted',
  //       message: `Wallet '${username}' is not whitelisted`
  //     });
  //   }
  // }else if(type === 'wallet'){
  //   const { address } = request.body as WalletLoginRequest;
  //   const findMerchantWhitelist = await prismaClient.merchantWhitelist.findFirst({
  //     where: {
  //       value: address,
  //       type: 'wallet'
  //     }
  //   })

  //   if(!findMerchantWhitelist) {
  //     return reply.code(403).send({
  //       code: 'wallet-not-whitelisted',
  //       error: 'wallet-not-whitelisted',
  //       message: `Wallet '${address}' is not whitelisted`
  //     });
  //   }
  // }
};
