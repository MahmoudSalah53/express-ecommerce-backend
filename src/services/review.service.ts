import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateReviewInput, ListReviewsQuery, UpdateReviewInput } from "../validators/review.validator";

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  createdAt: true,
  user: { select: { name: true } },
} as const;

export const reviewService = {
  create: async (userId: number, productId: number, input: CreateReviewInput) => {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new AppError("Product not found", 404);

    const delivered = await prisma.orderItem.findFirst({
      where: { productId, order: { userId, status: "DELIVERED" } },
      select: { id: true },
    });
    if (!delivered) {
      throw new AppError("You can only review products from a delivered order", 403);
    }

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    });
    if (existing) throw new AppError("You already reviewed this product", 409);

    return prisma.review.create({
      data: { userId, productId, rating: input.rating, comment: input.comment },
      select: reviewSelect,
    });
  },

  update: async (userId: number, id: number, input: UpdateReviewInput) => {
    const review = await prisma.review.findFirst({ where: { id, userId }, select: { id: true } });
    if (!review) throw new AppError("Review not found", 404);

    return prisma.review.update({
      where: { id },
      data: {
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
        ...(input.comment !== undefined ? { comment: input.comment } : {}),
      },
      select: reviewSelect,
    });
  },

  delete: async (userId: number, id: number) => {
    const review = await prisma.review.findFirst({ where: { id, userId }, select: { id: true } });
    if (!review) throw new AppError("Review not found", 404);

    return prisma.review.delete({ where: { id }, select: reviewSelect });
  },

  listForProduct: async (productId: number, query: ListReviewsQuery, isAdmin: boolean) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });
    if (!product || (!isAdmin && !product.isActive)) {
      throw new AppError("Product not found", 404);
    }

    const [items, stats] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: reviewSelect,
      }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const average = stats._avg.rating === null ? 0 : Math.round(stats._avg.rating * 10) / 10;

    return { items, average, count: stats._count._all };
  },
};
