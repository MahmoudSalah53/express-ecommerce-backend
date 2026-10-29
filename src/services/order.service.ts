import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import {
  AdminListOrdersQuery,
  CreateOrderInput,
  ListOrdersQuery,
  UpdateOrderStatusInput,
} from "../validators/order.validator";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function restoreStock(tx: Prisma.TransactionClient, orderId: number) {
  const items = await tx.orderItem.findMany({ where: { orderId } });

  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}

export const orderService = {
  adminList: async (query: AdminListOrdersQuery) => {
    const where: Prisma.OrderWhereInput = query.status ? { status: query.status } : {};

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total };
  },

  updateStatus: async (id: number, input: UpdateOrderStatusInput) => {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new AppError("Order not found", 404);

      if (!allowedTransitions[order.status].includes(input.status)) {
        throw new AppError(`Cannot change order status from ${order.status} to ${input.status}`, 400);
      }

      const result = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status: input.status },
      });

      if (result.count === 0) {
        throw new AppError("Order status changed by another request. Try again", 409);
      }

      if (input.status === "CANCELLED") {
        await restoreStock(tx, id);
      }

      return tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    });
  },

  cancel: async (userId: number, id: number) => {
    return prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id, userId, status: "PENDING" },
        data: { status: "CANCELLED" },
      });

      if (result.count === 0) {
        const order = await tx.order.findFirst({ where: { id, userId } });
        if (!order) throw new AppError("Order not found", 404);
        throw new AppError(`Only pending orders can be cancelled. This order is ${order.status}`, 400);
      }

      await restoreStock(tx, id);

      return tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    });
  },

  list: async (userId: number, query: ListOrdersQuery) => {
    const where: Prisma.OrderWhereInput = { userId };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: { items: true },
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total };
  },

  getById: async (userId: number, id: number) => {
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!order) throw new AppError("Order not found", 404);

    return order;
  },

  create: async (userId: number, input: CreateOrderInput) => {
    const address = input.addressId !== undefined
      ? await prisma.address.findFirst({ where: { id: input.addressId, userId } })
      : await prisma.address.findFirst({ where: { userId, isDefault: true } });

    if (!address) {
      if (input.addressId !== undefined) throw new AppError("Address not found", 404);
      throw new AppError("Add an address before placing an order", 400);
    }

    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, price: true, isActive: true } },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new AppError("Cart is empty", 400);
      }

      const hiddenItem = cart.items.find((item) => !item.product.isActive);
      if (hiddenItem) {
        throw new AppError(`${hiddenItem.product.name} is no longer available. Remove it from your cart first`, 400);
      }

      for (const item of cart.items) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          throw new AppError(`Not enough stock for ${item.product.name}`, 400);
        }
      }

      const subtotal = cart.items.reduce(
        (sum, item) => sum.add(item.product.price.mul(item.quantity)),
        new Prisma.Decimal(0),
      );

      let discount = new Prisma.Decimal(0);
      let couponCode: string | null = null;

      if (input.couponCode !== undefined) {
        const coupon = await tx.coupon.findUnique({ where: { code: input.couponCode } });
        if (!coupon) throw new AppError("Invalid coupon", 400);

        const result = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            isActive: true,
            expiresAt: { gt: new Date() },
            usedCount: { lt: tx.coupon.fields.usageLimit },
          },
          data: { usedCount: { increment: 1 } },
        });

        if (result.count === 0) {
          throw new AppError("Coupon is inactive, expired, or used up", 400);
        }

        discount = subtotal.mul(coupon.percent).div(100).toDecimalPlaces(2);
        couponCode = coupon.code;
      }

      const order = await tx.order.create({
        data: {
          userId,
          subtotal,
          discount,
          total: subtotal.sub(discount),
          couponCode,
          shippingCity: address.city,
          shippingStreet: address.street,
          shippingPhone: address.phone,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  },
};
