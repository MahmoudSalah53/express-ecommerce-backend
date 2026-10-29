import { z } from "zod";

export const createOrderSchema = z
  .object({
    addressId: z.coerce.number().int().positive().optional(),
    couponCode: z.string().optional(),
  })
  .default({});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const orderStatusSchema = z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"]);

export const adminListOrdersQuerySchema = listOrdersQuerySchema.extend({
  status: orderStatusSchema.optional(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type AdminListOrdersQuery = z.infer<typeof adminListOrdersQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
