import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateCouponInput, UpdateCouponInput } from "../validators/coupon.validator";

export const couponService = {
  list: async () => {
    return prisma.coupon.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
  },

  create: async (input: CreateCouponInput) => {
    const existing = await prisma.coupon.findUnique({ where: { code: input.code }, select: { id: true } });
    if (existing) throw new AppError("Coupon code already exists", 409);

    return prisma.coupon.create({
      data: {
        code: input.code,
        percent: input.percent,
        expiresAt: input.expiresAt,
        usageLimit: input.usageLimit,
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  },

  update: async (id: number, input: UpdateCouponInput) => {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new AppError("Coupon not found", 404);

    if (input.usageLimit !== undefined && input.usageLimit < coupon.usedCount) {
      throw new AppError(`usageLimit cannot be less than usedCount (${coupon.usedCount})`, 400);
    }

    return prisma.coupon.update({
      where: { id },
      data: {
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
        ...(input.usageLimit !== undefined ? { usageLimit: input.usageLimit } : {}),
      },
    });
  },
};
