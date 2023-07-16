import bcrypt from 'bcrypt';
import { Merchant, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateMerchantToken = async (merchant: Merchant) => {
  const token = jwt.sign(
    {
      id: merchant.id,
      type: merchant.type,
      seed: nanoid(5),
    },
    JWT_SECRET,
    {
      subject: 'merchant',
      issuer: 'v3rify',
      expiresIn: '1y',
    },
  );

  return token;
};

export const generateUserToken = async (user: User) => {
  const token = jwt.sign(
    {
      id: user.id,
      type: 'wallet',
      seed: nanoid(5),
    },
    JWT_SECRET,
    {
      subject: 'user',
      issuer: 'v3rify',
      expiresIn: '1y',
    },
  );

  return token;
};

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};
