import { z } from "zod";

export const createAddressSchema = z.object({
  city: z.string().min(1),
  street: z.string().min(1),
  phone: z.string().min(1),
});

export const updateAddressSchema = createAddressSchema
  .partial()
  .extend({ isDefault: z.boolean().optional() })
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field is required" });

export const addressIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type AddressIdParam = z.infer<typeof addressIdParamSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
