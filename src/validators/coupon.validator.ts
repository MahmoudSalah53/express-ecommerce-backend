import { z } from "zod";

const futureDate = z.coerce
  .date()
  .refine((date) => date.getTime() > Date.now(), { message: "expiresAt must be in the future" });

export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, "code may contain only letters, numbers, - or _")
    .transform((code) => code.toUpperCase()),
  percent: z.number().int().min(1).max(80),
  expiresAt: futureDate,
  usageLimit: z.number().int().min(1),
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = z
  .object({
    isActive: z.boolean().optional(),
    expiresAt: futureDate.optional(),
    usageLimit: z.number().int().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field is required" });

export const couponIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
