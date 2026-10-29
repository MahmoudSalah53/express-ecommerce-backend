import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { ListReviewsQuery } from "../validators/review.validator";

export const reviewService = {
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
