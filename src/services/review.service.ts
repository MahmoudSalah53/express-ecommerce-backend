import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateReviewInput, ListReviewsQuery } from "../validators/review.validator";

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
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
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
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
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
