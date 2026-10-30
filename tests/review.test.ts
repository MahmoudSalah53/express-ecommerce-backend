import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createMockNext, createMockReq, createMockRes, prismaMock, resetPrismaMock } from "./helpers";
import {
  createProductReview,
  deleteReview,
  listProductReviews,
  updateReview,
} from "../src/controllers/review.controller";
import { reviewService } from "../src/services/review.service";
import { AppError } from "../src/utils/AppError";

describe("Review Service & Controller", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("reviewService", () => {
    it("create throws 404 if product missing, 403 if no DELIVERED order, 409 if duplicate, and creates review when valid", async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => reviewService.create(1, 10, { rating: 5 }),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 10 });
      prismaMock.orderItem.findFirst.mockResolvedValueOnce(null);
      await assert.rejects(
        () => reviewService.create(1, 10, { rating: 5 }),
        (err: any) => err instanceof AppError && err.statusCode === 403,
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 10 });
      prismaMock.orderItem.findFirst.mockResolvedValueOnce({ id: 100 });
      prismaMock.review.findUnique.mockResolvedValueOnce({ id: 50 });
      await assert.rejects(
        () => reviewService.create(1, 10, { rating: 5 }),
        (err: any) => err instanceof AppError && err.statusCode === 409,
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 10 });
      prismaMock.orderItem.findFirst.mockResolvedValueOnce({ id: 100 });
      prismaMock.review.findUnique.mockResolvedValueOnce(null);
      prismaMock.review.create.mockResolvedValueOnce({
        id: 1,
        rating: 5,
        comment: "Great",
        user: { name: "Ali" },
      });

      const created = await reviewService.create(1, 10, { rating: 5, comment: "Great" });
      assert.equal(created.rating, 5);
    });

    it("update and delete throw 404 if review is missing or belongs to another user", async () => {
      prismaMock.review.findFirst.mockResolvedValueOnce(null);
      await assert.rejects(
        () => reviewService.update(1, 99, { rating: 4 }),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.review.findFirst.mockResolvedValueOnce({ id: 1 });
      prismaMock.review.update.mockResolvedValueOnce({ id: 1, rating: 4 });
      const updated = await reviewService.update(1, 1, { rating: 4 });
      assert.equal(updated.rating, 4);

      prismaMock.review.findFirst.mockResolvedValueOnce(null);
      await assert.rejects(
        () => reviewService.delete(1, 99),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.review.findFirst.mockResolvedValueOnce({ id: 1 });
      prismaMock.review.delete.mockResolvedValueOnce({ id: 1 });
      const deleted = await reviewService.delete(1, 1);
      assert.equal(deleted.id, 1);
    });

    it("listForProduct returns 0 average when no reviews exist and rounds average to 1 decimal", async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 10, isActive: false });
      await assert.rejects(
        () => reviewService.listForProduct(10, { page: 1, limit: 10 }, false),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 10, isActive: true });
      prismaMock.review.findMany.mockResolvedValueOnce([]);
      prismaMock.review.aggregate.mockResolvedValueOnce({
        _avg: { rating: null },
        _count: { _all: 0 },
      });

      const empty = await reviewService.listForProduct(10, { page: 1, limit: 10 }, false);
      assert.deepEqual(empty, { items: [], average: 0, count: 0 });

      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 10, isActive: true });
      prismaMock.review.findMany.mockResolvedValueOnce([{ id: 1, rating: 4 }]);
      prismaMock.review.aggregate.mockResolvedValueOnce({
        _avg: { rating: 4.333333 },
        _count: { _all: 3 },
      });

      const withStats = await reviewService.listForProduct(10, { page: 1, limit: 10 }, false);
      assert.equal(withStats.average, 4.3);
      assert.equal(withStats.count, 3);
    });
  });

  describe("review.controller", () => {
    it("createProductReview, listProductReviews, updateReview, deleteReview respond properly", async () => {
      const user = { id: 1, name: "Ali", email: "a@b.c", role: "CUSTOMER" as const };
      const next = createMockNext();

      prismaMock.product.findUnique.mockResolvedValue({ id: 10, isActive: true });
      prismaMock.orderItem.findFirst.mockResolvedValue({ id: 1 });
      prismaMock.review.findUnique.mockResolvedValue(null);
      prismaMock.review.create.mockResolvedValue({ id: 1, rating: 5 });

      const resCreate = createMockRes();
      await createProductReview(
        createMockReq({ user, params: { id: "10" } as any, body: { rating: 5 } }),
        resCreate,
        next,
      );
      assert.equal(resCreate.statusCode, 201);

      prismaMock.review.findMany.mockResolvedValue([{ id: 1, rating: 5 }]);
      prismaMock.review.aggregate.mockResolvedValue({ _avg: { rating: 5 }, _count: { _all: 1 } });
      const resList = createMockRes();
      await listProductReviews(
        createMockReq({ params: { id: "10" } as any, query: { page: 1, limit: 10 } as any }),
        resList,
        next,
      );
      assert.equal(resList.statusCode, 200);
      assert.equal(resList.body.data.average, 5);

      prismaMock.review.findFirst.mockResolvedValue({ id: 1 });
      prismaMock.review.update.mockResolvedValue({ id: 1, rating: 4 });
      const resUpdate = createMockRes();
      await updateReview(
        createMockReq({ user, params: { id: "1" } as any, body: { rating: 4 } }),
        resUpdate,
        next,
      );
      assert.equal(resUpdate.statusCode, 200);

      prismaMock.review.findFirst.mockResolvedValue({ id: 1 });
      prismaMock.review.delete.mockResolvedValue({ id: 1 });
      const resDel = createMockRes();
      await deleteReview(createMockReq({ user, params: { id: "1" } as any }), resDel, next);
      assert.equal(resDel.statusCode, 200);
    });
  });
});
