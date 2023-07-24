import { Static, Type } from '@sinclair/typebox';

export const ShopAnalyticsResponseSchema = Type.Object({
  totalClaimed: Type.Object({
    total: Type.Number(),
    periodicTotal: Type.Array(
      Type.Object({
        value: Type.Union([Type.Literal('today'), Type.Literal('week'), Type.Literal('month'), Type.Literal('year')]),
        total: Type.Number(),
      }),
    ),
    totalAddressClaimed: Type.Number(),
  }),
});
