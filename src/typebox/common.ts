import { Static, Type,  } from '@sinclair/typebox';

export const ErrorSchema = Type.Object({
  code: Type.String(),
  error: Type.String(),
  message: Type.String(),
});

export const ShopType = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
    description: Type.String(),
    address: Type.String(),
    phoneNumber: Type.String(),
    email: Type.String(),
    image: Type.String(),
    createdAt: Type.String(),
    updatedAt: Type.String(),
  },
  {
    description: 'Shop',
  },
);

export const ShopEditType = Type.Object({
  name: Type.String(),
  description: Type.String(),
  address: Type.String(),
  phoneNumber: Type.String(),
  email: Type.String(),
  image: Type.String(),
})