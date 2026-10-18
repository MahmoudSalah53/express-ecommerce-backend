import { z } from "zod";

export const createCartSchema = z.object({
   productId: z.coerce.number().int().positive(),
   quantity: z.coerce.number().int().min(1).max(99),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
});

export const cartIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCartInput = z.infer<typeof createCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartIdParam = z.infer<typeof cartIdParamSchema>;