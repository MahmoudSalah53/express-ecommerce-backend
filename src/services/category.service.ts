import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";


function generateSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

export const categoryService = {
  async create(input: CreateCategoryInput) {
    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug: generateSlug(input.name),
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return category;
  },

  async getAll() {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  },

  async getById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category;
  },

  async update(id: number, input: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Category not found", 404);
    }

    const data: { name?: string; slug?: string } = {};
    if (input.name) data.name = input.name;
    if (input.slug) data.slug = input.slug;
    else if (input.name) data.slug = generateSlug(input.name);

    const category = await prisma.category.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return category;
  },

  async delete(id: number) {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      throw new AppError("Category not found", 404);
    }
    if (existing._count.products > 0) {
      throw new AppError("Category has products", 409);
    }

    const category = await prisma.category.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return category;
  }
};
