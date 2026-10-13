import { z } from "zod";

export const createCartSchema = z.object({
   productId: z.coerce.number().int().positive(),
   quantity: z.coerce.number().int().positive(),
});

export const cartIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCartInput = z.infer<typeof createCartSchema>;
