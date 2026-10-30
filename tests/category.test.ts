import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createMockNext, createMockReq, createMockRes, prismaMock, resetPrismaMock } from "./helpers";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../src/controllers/category.controller";
import { categoryService } from "../src/services/category.service";
import { AppError } from "../src/utils/AppError";

describe("Category Service & Controller", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("categoryService", () => {
    it("create generates slug from name and creates category", async () => {
      prismaMock.category.create.mockImplementation(async ({ data }: any) => ({
        id: 1,
        name: data.name,
        slug: data.slug,
      }));

      const result = await categoryService.create({ name: "  Mobile   Phones " });
      assert.deepEqual(result, {
        id: 1,
        name: "  Mobile   Phones ",
        slug: "mobile-phones",
      });
    });

    it("getAll returns categories sorted by name", async () => {
      const list = [
        { id: 1, name: "Books", slug: "books" },
        { id: 2, name: "Phones", slug: "phones" },
      ];
      prismaMock.category.findMany.mockResolvedValue(list);

      const result = await categoryService.getAll();
      assert.deepEqual(result, list);
      assert.deepEqual(prismaMock.category.findMany.calls[0][0].orderBy, { name: "asc" });
    });

    it("getById returns category when found and throws 404 when missing", async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce({ id: 1, name: "Books", slug: "books" });
      const found = await categoryService.getById(1);
      assert.deepEqual(found, { id: 1, name: "Books", slug: "books" });

      prismaMock.category.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => categoryService.getById(999),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );
    });

    it("update regenerates slug when name is updated and throws 404 when missing", async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => categoryService.update(99, { name: "New" }),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.category.findUnique.mockResolvedValueOnce({ id: 1, name: "Old", slug: "old" });
      prismaMock.category.update.mockImplementation(async ({ data }: any) => ({
        id: 1,
        name: data.name ?? "Old",
        slug: data.slug ?? "old",
      }));

      const updated = await categoryService.update(1, { name: "Smart Watches" });
      assert.deepEqual(updated, { id: 1, name: "Smart Watches", slug: "smart-watches" });
    });

    it("delete throws 404 if not found, 409 if category has products, and deletes when empty", async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => categoryService.delete(1),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.category.findUnique.mockResolvedValueOnce({
        id: 1,
        name: "Phones",
        slug: "phones",
        _count: { products: 3 },
      });
      await assert.rejects(
        () => categoryService.delete(1),
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 409 &&
          err.message === "Category has products",
      );

      prismaMock.category.findUnique.mockResolvedValueOnce({
        id: 1,
        name: "Phones",
        slug: "phones",
        _count: { products: 0 },
      });
      prismaMock.category.delete.mockResolvedValue({ id: 1, name: "Phones", slug: "phones" });

      const deleted = await categoryService.delete(1);
      assert.deepEqual(deleted, { id: 1, name: "Phones", slug: "phones" });
    });
  });

  describe("category.controller", () => {
    it("createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory return expected responses", async () => {
      const next = createMockNext();

      prismaMock.category.create.mockResolvedValue({ id: 1, name: "TV", slug: "tv" });
      const resCreate = createMockRes();
      await createCategory(createMockReq({ body: { name: "TV" } }), resCreate, next);
      assert.equal(resCreate.statusCode, 201);

      prismaMock.category.findMany.mockResolvedValue([{ id: 1, name: "TV", slug: "tv" }]);
      const resAll = createMockRes();
      await getAllCategories(createMockReq(), resAll, next);
      assert.equal(resAll.statusCode, 200);

      prismaMock.category.findUnique.mockResolvedValue({ id: 1, name: "TV", slug: "tv" });
      const resById = createMockRes();
      await getCategoryById(createMockReq({ params: { id: "1" } as any }), resById, next);
      assert.equal(resById.statusCode, 200);

      prismaMock.category.findUnique.mockResolvedValue({ id: 1, name: "TV", slug: "tv" });
      prismaMock.category.update.mockResolvedValue({ id: 1, name: "TVs", slug: "tvs" });
      const resUpdate = createMockRes();
      await updateCategory(
        createMockReq({ params: { id: "1" } as any, body: { name: "TVs" } }),
        resUpdate,
        next,
      );
      assert.equal(resUpdate.statusCode, 200);

      prismaMock.category.findUnique.mockResolvedValue({
        id: 1,
        name: "TVs",
        slug: "tvs",
        _count: { products: 0 },
      });
      prismaMock.category.delete.mockResolvedValue({ id: 1, name: "TVs", slug: "tvs" });
      const resDelete = createMockRes();
      await deleteCategory(createMockReq({ params: { id: "1" } as any }), resDelete, next);
      assert.equal(resDelete.statusCode, 200);
    });
  });
});
