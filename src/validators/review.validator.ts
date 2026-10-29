import { z } from "zod";

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000).optional(),
});

export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
