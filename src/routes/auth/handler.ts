import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';

import { generateMerchantToken, generateUserToken, hashPassword } from './helpers.js';
import { prismaClient } from '../../prisma/index.js';
import { SiweMessage, generateNonce } from 'siwe';
import { UsernameLoginRequest, WalletLoginRequest } from '../../@types/Auth.js';

export const nonceHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const nonce = generateNonce();
    return reply.code(200).send(nonce);
  } catch (error) {
    console.log(error);
    reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const userWalletLoginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { address, signature, message } = request.body as WalletLoginRequest;

    const siweMessage = new SiweMessage(message);

    try {
      await siweMessage.verify({
        signature: signature,
      });

      // Check if user already exists
      const existingUser = await prismaClient.user.findUnique({
        where: {
          walletAddress: address,
        },
      });

      if (!existingUser) {
        console.log('User does not exist');
        // Create user
        const user = await prismaClient.user.create({
          data: {
            walletAddress: address,
          },
        });

        const token = await generateUserToken(user);

        return reply.code(200).send({
          id: user.id,
          token: token,
          type: 'wallet',
        });
      } else {
        console.log('User exists');
        const token = await generateUserToken(existingUser);

        return reply.code(200).send({
          id: existingUser.id,
          token: token,
          type: 'wallet',
        });
      }
    } catch (error) {
      console.log(error);
      return reply.code(400).send({
        code: 'invalid-signature',
        error: 'invalid-signature',
        message: 'Invalid signature',
      });
    }
  } catch (error) {
    console.log(error);
    reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const merchantRegisterHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { type, username, password } = request.body as MerchantRegisterRequest;

    if (type === 'username') {
      // Check if username already exists
      const existingMerchant = await prismaClient.merchant.findUnique({
        where: {
          username: username,
        },
      });

      if (existingMerchant) {
        return reply.code(400).send({
          code: 'username-already-exists',
          error: 'username-already-exists',
          message: `Username '${username}' already exists`,
        });
      }

      const passwordHash = await hashPassword(password);

      const merchant = await prismaClient.merchant.create({
        data: {
          type: 'username',
          username: username,
          passwordHash: passwordHash,
        },
      });

      const token = await generateMerchantToken(merchant);

      return reply.code(200).send({
        id: merchant.id,
        type: merchant.type,
        token: token,
      });
    } else {
      return reply.code(400).send({
        code: 'invalid-type',
        error: 'invalid-type',
        message: 'Invalid type, must be username',
      });
    }
  } catch (error) {
    console.log(error);
    reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const merchantCheckUsernameHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { username } = request.query as {
      username: string;
    };

    const existingMerchant = await prismaClient.merchant.findUnique({
      where: {
        username: username,
      },
    });

    if (existingMerchant) {
      return reply.code(200).send(false);
    } else {
      return reply.code(200).send(true);
    }
  } catch (error) {
    console.log(error);
    reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const merchantUsernameLoginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { username, password } = request.body as UsernameLoginRequest;

    const merchant = await prismaClient.merchant.findUnique({
      where: {
        username: username,
      },
    });

    if (!merchant) {
      return reply.code(400).send({
        code: 'invalid-username',
        error: 'invalid-username',
        message: `Account with username '${username}' does not exist`,
      });
    }

    const passwordMatch = await bcrypt.compare(password, merchant.passwordHash as string);

    if (!passwordMatch) {
      return reply.code(400).send({
        code: 'invalid-password',
        error: 'invalid-password',
        message: `Invalid password`,
      });
    }

    const token = await generateMerchantToken(merchant);

    return reply.code(200).send({
      id: merchant.id,
      token: token,
      type: 'username',
    });
  } catch (error) {
    console.log(error);
    reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: 'Internal server error',
    });
  }
};

export const merchantWalletLoginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { address, signature, message } = request.body as WalletLoginRequest;

    const siweMessage = new SiweMessage(message);

    try {
      await siweMessage.verify({
        signature: signature,
      });

      // Check if merchant already exists
      const existingMerchant = await prismaClient.merchant.findUnique({
        where: {
          walletAddress: address,
        },
      });

      if (!existingMerchant) {
        // Create merchant
        const merchant = await prismaClient.merchant.create({
          data: {
            walletAddress: address,
            type: 'wallet',
          },
        });

        const token = await generateMerchantToken(merchant);

        return reply.code(200).send({
          id: merchant.id,
          token: token,
          type: 'wallet',
        });
      } else {
        const token = await generateMerchantToken(existingMerchant);

        return reply.code(200).send({
          id: existingMerchant.id,
          token: token,
          type: 'wallet',
        });
      }
    } catch (error) {
      console.log(error);
      return reply.code(400).send({
        code: 'invalid-signature',
        error: 'invalid-signature',
        message: 'Invalid signature',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const merchantMeHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.user;

    const merchant = await prismaClient.merchant.findUnique({
      where: {
        id: id,
      },
      include: {
        shops: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!merchant) {
      return reply.code(404).send({
        code: 'merchant-not-found',
        error: 'merchant-not-found',
        message: 'Merchant not found',
      });
    }

    return reply.code(200).send(merchant);
  } catch (error) {
    console.error(error);
    reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: error,
    });
  }
};

export const merchantEditAccountInfoHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.user;
    console.log('id', id);

    const { email, phoneNumber } = request.body as {
      email?: string;
      phoneNumber?: string;
    };

    const updatedMerchant = await prismaClient.merchant.update({
      where: {
        id: id,
      },
      data: {
        email: email,
        phoneNumber: phoneNumber,
      },
    });

    return reply.code(200).send('Account info updated successfully');
  } catch (error) {
    console.error(error);
    reply.code(500).send({
      code: 'internal-server-error',
      error: 'internal-server-error',
      message: error,
    });
  }
};

export const merchantChangePasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { newPassword } = request.body as {
    newPassword: string;
  };
  const { id: userId } = request.user;

  const merchant = await prismaClient.merchant.findUnique({
    where: {
      id: userId,
    },
  });

  if(merchant.type !== 'username'){
    return reply.code(400).send({
      code: 'invalid-type',
      error: 'invalid-type',
      message: 'Invalid account type, must be username',
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prismaClient.merchant.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash: passwordHash,
    },
  });

  return reply.code(200).send('Password changed successfully');
};
