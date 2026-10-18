import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateAddressInput, UpdateAddressInput } from "../validators/address.validator";

export const addressService = {
  getAll: async (userId: number) => {
    const addresses = await prisma.address.findMany({
      where: {
        userId
      }
    });

    return addresses;
  },

  create: async (userId: number, input: CreateAddressInput) => { 
    const count = await prisma.address.count({
      where: {
        userId
      }
    });

    const address = await prisma.address.create({
      data: {
        ...input,
        isDefault: count === 0,
        userId
      }
    });

    return address;
  },

  update: async (userId: number, id: number, input: UpdateAddressInput) => {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError("Address not found", 404);

    return prisma.$transaction(async (tx) => {
      if (input.isDefault === true) {
        await tx.address.updateMany({
          where: { userId, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: input,
      });
    });
  },

  delete: async (userId: number, id: number) => {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw new AppError("Address not found", 404);

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } });

      if (existing.isDefault) {
        const oldestAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: "asc" },
        });

        if (oldestAddress) {
          await tx.address.update({
            where: { id: oldestAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return { message: "Address deleted successfully" };
  }
};
