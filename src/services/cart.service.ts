import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";


export const cartService = {
  getCart: async (userId: number) => {
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                stock: true,
                isActive: true,
              }
            }
          },
        }
      },
    })
    if (!cart) {
      return { items: [], subtotal: new Prisma.Decimal(0) };
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: item.product,
    }));

    const subtotal = cart.items.reduce((sum, item) => {
      if (!item.product.isActive) return sum;
      return sum.add(item.product.price.mul(item.quantity));
    }, new Prisma.Decimal(0));

    return { items, subtotal };
  },

  create: async (userId: number, productId: number, quantity: number) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, isActive: true },
    });
    if (!product || !product.isActive) throw new AppError("Product not found", 404);
  
    const cart = await prisma.cart.findUnique({ where: { userId } });
    const existing = cart
      ? await prisma.cartItem.findUnique({
          where: { cartId_productId: { cartId: cart.id, productId } },
        })
      : null;
  
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (nextQuantity > product.stock) throw new AppError("Not enough stock", 400);
  
    const savedCart = cart ?? (await prisma.cart.create({ data: { userId } }));
  
    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      });
    }
  
    return prisma.cartItem.create({
      data: { cartId: savedCart.id, productId, quantity: nextQuantity },
    });
  },

  updateItem: async (userId: number, itemId: number, quantity: number) => {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: { select: { userId: true } },
        product: { select: { stock: true } },
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new AppError("Cart item not found", 404);
    }

    if (quantity > item.product.stock) {
      throw new AppError("Not enough stock", 400);
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  },
};
