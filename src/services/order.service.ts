import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateOrderInput } from "../validators/order.validator";

export const orderService = {
  create: async (userId: number, input: CreateOrderInput) => {
    if (input.couponCode !== undefined) {
      throw new AppError("Coupons are not available yet", 400);
    }

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

      const order = await tx.order.create({
        data: {
          userId,
          subtotal,
          discount: new Prisma.Decimal(0),
          total: subtotal,
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
