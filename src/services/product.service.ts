import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateProductInput, ListProductsQuery } from "../validators/product.validator";

export const productService = {
  async list(query: ListProductsQuery, isAdmin: boolean) {
    const where: Prisma.ProductWhereInput = {};

    if (!(isAdmin && query.includeInactive === "true")) {
      where.isActive = true;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.name = { contains: query.search, mode: "insensitive" };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { id: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          imageUrl: true,
          isActive: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  async getById(id: number, isAdmin: boolean) {

    const where: Prisma.ProductWhereUniqueInput = { id };

    const product = await prisma.product.findUnique({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
        isActive: true,
        category: { select: { id: true, name: true, slug: true } },
      }
    })

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (!isAdmin && !product.isActive) {
      throw new AppError("Product not found", 404);
    }

    return product;
  },

  async create(input: CreateProductInput) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new AppError("Category not found", 404);

    const product = await prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        stock: input.stock,
        imageUrl: input.imageUrl,
        categoryId: input.categoryId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
      }
    });

    return product;
  }


};
