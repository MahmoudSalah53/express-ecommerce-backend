import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createMockNext, createMockReq, createMockRes, prismaMock, resetPrismaMock } from "./helpers";
import {
  createProduct,
  deletedProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../src/controllers/product.controller";
import { productService } from "../src/services/product.service";
import { AppError } from "../src/utils/AppError";

describe("Product Service & Controller", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("productService.list", () => {
    it("filters active products by default and applies search, categoryId, and price range", async () => {
      prismaMock.product.findMany.mockResolvedValue([{ id: 1, name: "Phone" }]);
      prismaMock.product.count.mockResolvedValue(1);

      const res = await productService.list(
        {
          page: 2,
          limit: 5,
          categoryId: 3,
          search: "phone",
          minPrice: 100,
          maxPrice: 500,
          includeInactive: "true",
        },
        false, // not admin -> should still filter isActive: true
      );

      assert.equal(res.total, 1);
      const findManyArg = prismaMock.product.findMany.calls[0][0];
      assert.equal(findManyArg.where.isActive, true);
      assert.equal(findManyArg.where.categoryId, 3);
      assert.deepEqual(findManyArg.where.name, { contains: "phone", mode: "insensitive" });
      assert.deepEqual(findManyArg.where.price, { gte: 100, lte: 500 });
      assert.equal(findManyArg.skip, 5);
      assert.equal(findManyArg.take, 5);
    });

    it("includes inactive products only when caller is admin and includeInactive is 'true'", async () => {
      prismaMock.product.findMany.mockResolvedValue([]);
      prismaMock.product.count.mockResolvedValue(0);

      await productService.list({ page: 1, limit: 10, includeInactive: "true" }, true);
      const findManyArg = prismaMock.product.findMany.calls[0][0];
      assert.equal(findManyArg.where.isActive, undefined);
    });
  });

  describe("productService.getById", () => {
    it("returns active product, hides inactive product from customer (404), shows inactive to admin", async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => productService.getById(1, false),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({
        id: 1,
        name: "Hidden Phone",
        isActive: false,
      });
      await assert.rejects(
        () => productService.getById(1, false),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({
        id: 1,
        name: "Hidden Phone",
        isActive: false,
      });
      const adminView = await productService.getById(1, true);
      assert.equal(adminView.id, 1);
    });
  });

  describe("productService.create, update, delete", () => {
    it("create throws 404 when category does not exist and creates product when valid", async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () =>
          productService.create({
            name: "Phone",
            description: "Desc",
            price: 100,
            stock: 5,
            categoryId: 99,
          }),
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.message === "Category not found",
      );

      prismaMock.category.findUnique.mockResolvedValueOnce({ id: 1 });
      prismaMock.product.create.mockResolvedValue({ id: 10, name: "Phone", stock: 5 });

      const created = await productService.create({
        name: "Phone",
        description: "Desc",
        price: 100,
        stock: 5,
        categoryId: 1,
      });
      assert.equal(created.id, 10);
    });

    it("update throws 404 for missing product or category, and replaces fields", async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => productService.update(1, { stock: 20 }),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 1 });
      prismaMock.category.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => productService.update(1, { categoryId: 99 }),
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.message === "Category not found",
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 1 });
      prismaMock.product.update.mockResolvedValue({ id: 1, stock: 20 });
      const updated = await productService.update(1, { stock: 20 });
      assert.equal(updated.stock, 20);
    });

    it("delete soft-deletes product by setting isActive = false", async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => productService.delete(1),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 1 });
      prismaMock.product.update.mockResolvedValue({ id: 1, name: "Phone" });

      await productService.delete(1);
      assert.deepEqual(prismaMock.product.update.calls[0][0].data, { isActive: false });
    });
  });

  describe("product.controller", () => {
    it("listProducts, getProductById, createProduct, updateProduct, deletedProduct work properly", async () => {
      const next = createMockNext();

      prismaMock.product.findMany.mockResolvedValue([{ id: 1, name: "Phone" }]);
      prismaMock.product.count.mockResolvedValue(1);
      const resList = createMockRes();
      await listProducts(
        createMockReq({ query: { page: 1, limit: 10, includeInactive: "false" } as any }),
        resList,
        next,
      );
      assert.equal(resList.body.status, "success");
      assert.deepEqual(resList.body.meta, { page: 1, limit: 10, total: 1 });

      prismaMock.product.findUnique.mockResolvedValue({ id: 1, name: "Phone", isActive: true });
      const resGet = createMockRes();
      await getProductById(createMockReq({ params: { id: "1" } as any }), resGet, next);
      assert.equal(resGet.statusCode, 200);

      prismaMock.category.findUnique.mockResolvedValue({ id: 1 });
      prismaMock.product.create.mockResolvedValue({ id: 1, name: "Phone" });
      const resCreate = createMockRes();
      await createProduct(
        createMockReq({
          body: { name: "Phone", description: "D", price: 10, stock: 2, categoryId: 1 },
        }),
        resCreate,
        next,
      );
      assert.equal(resCreate.statusCode, 201);

      prismaMock.product.findUnique.mockResolvedValue({ id: 1 });
      prismaMock.product.update.mockResolvedValue({ id: 1, name: "Updated" });
      const resUpdate = createMockRes();
      await updateProduct(
        createMockReq({ params: { id: "1" } as any, body: { name: "Updated" } }),
        resUpdate,
        next,
      );
      assert.equal(resUpdate.statusCode, 200);

      prismaMock.product.findUnique.mockResolvedValue({ id: 1 });
      prismaMock.product.update.mockResolvedValue({ id: 1, name: "Updated" });
      const resDel = createMockRes();
      await deletedProduct(createMockReq({ params: { id: "1" } as any }), resDel, next);
      assert.equal(resDel.statusCode, 200);
    });
  });
});
