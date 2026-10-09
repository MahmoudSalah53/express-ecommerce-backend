import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
});

export const categoryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CategoryIdParamInput = z.infer<typeof categoryIdParamSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;