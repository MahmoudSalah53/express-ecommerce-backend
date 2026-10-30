import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createMockNext, createMockReq, createMockRes, prismaMock, resetPrismaMock } from "./helpers";
import { createCoupon, listCoupons, updateCoupon } from "../src/controllers/coupon.controller";
import { couponService } from "../src/services/coupon.service";
import { AppError } from "../src/utils/AppError";

describe("Coupon Service & Controller", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("couponService", () => {
    it("list returns all coupons sorted newest first", async () => {
      prismaMock.coupon.findMany.mockResolvedValue([{ id: 1, code: "SAVE10" }]);
      const res = await couponService.list();
      assert.equal(res.length, 1);
    });

    it("create throws 409 when code already exists and creates coupon when unique", async () => {
      const future = new Date(Date.now() + 86400_000);

      prismaMock.coupon.findUnique.mockResolvedValueOnce({ id: 1 });
      await assert.rejects(
        () =>
          couponService.create({
            code: "SAVE10",
            percent: 10,
            expiresAt: future,
            usageLimit: 50,
          }),
        (err: any) => err instanceof AppError && err.statusCode === 409,
      );

      prismaMock.coupon.findUnique.mockResolvedValueOnce(null);
      prismaMock.coupon.create.mockResolvedValueOnce({
        id: 2,
        code: "SAVE20",
        percent: 20,
        expiresAt: future,
        usageLimit: 50,
        isActive: true,
      });

      const created = await couponService.create({
        code: "SAVE20",
        percent: 20,
        expiresAt: future,
        usageLimit: 50,
      });
      assert.equal(created.code, "SAVE20");
    });

    it("update throws 404 when missing, 400 when usageLimit < usedCount, and updates when valid", async () => {
      prismaMock.coupon.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => couponService.update(99, { isActive: false }),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.coupon.findUnique.mockResolvedValueOnce({ id: 1, usedCount: 10, usageLimit: 20 });
      await assert.rejects(
        () => couponService.update(1, { usageLimit: 5 }),
        (err: any) => err instanceof AppError && err.statusCode === 400,
      );

      prismaMock.coupon.findUnique.mockResolvedValueOnce({ id: 1, usedCount: 10, usageLimit: 20 });
      prismaMock.coupon.update.mockResolvedValueOnce({ id: 1, isActive: false, usageLimit: 30 });
      const updated = await couponService.update(1, { isActive: false, usageLimit: 30 });
      assert.equal(updated.isActive, false);
      assert.equal(updated.usageLimit, 30);
    });
  });

  describe("coupon.controller", () => {
    it("listCoupons, createCoupon, updateCoupon return expected status codes", async () => {
      const next = createMockNext();
      const future = new Date(Date.now() + 86400_000);

      prismaMock.coupon.findMany.mockResolvedValue([{ id: 1, code: "SAVE10" }]);
      const resList = createMockRes();
      await listCoupons(createMockReq(), resList, next);
      assert.equal(resList.statusCode, 200);

      prismaMock.coupon.findUnique.mockResolvedValue(null);
      prismaMock.coupon.create.mockResolvedValue({ id: 1, code: "SAVE10" });
      const resCreate = createMockRes();
      await createCoupon(
        createMockReq({
          body: { code: "SAVE10", percent: 10, expiresAt: future, usageLimit: 10 },
        }),
        resCreate,
        next,
      );
      assert.equal(resCreate.statusCode, 201);

      prismaMock.coupon.findUnique.mockResolvedValue({ id: 1, usedCount: 0, usageLimit: 10 });
      prismaMock.coupon.update.mockResolvedValue({ id: 1, isActive: false });
      const resUpdate = createMockRes();
      await updateCoupon(
        createMockReq({ params: { id: "1" } as any, body: { isActive: false } }),
        resUpdate,
        next,
      );
      assert.equal(resUpdate.statusCode, 200);
    });
  });
});
