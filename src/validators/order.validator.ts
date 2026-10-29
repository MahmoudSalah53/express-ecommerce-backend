import { z } from "zod";

export const createOrderSchema = z
  .object({
    addressId: z.coerce.number().int().positive().optional(),
    couponCode: z.string().optional(),
  })
  .default({});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
