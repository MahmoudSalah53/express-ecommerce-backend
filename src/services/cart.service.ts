import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";


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
  }
};
