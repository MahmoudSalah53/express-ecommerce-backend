import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createMockNext, createMockReq, createMockRes, prismaMock, resetPrismaMock } from "./helpers";
import {
  createAddress,
  deleteAddress,
  getAllAddresses,
  updateAddress,
} from "../src/controllers/address.controller";
import { addressService } from "../src/services/address.service";
import { AppError } from "../src/utils/AppError";

describe("Address Service & Controller", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("addressService", () => {
    it("getAll returns caller's addresses", async () => {
      prismaMock.address.findMany.mockResolvedValue([{ id: 1, userId: 1, city: "Cairo" }]);
      const res = await addressService.getAll(1);
      assert.equal(res.length, 1);
      assert.deepEqual(prismaMock.address.findMany.calls[0][0], { where: { userId: 1 } });
    });

    it("create sets isDefault: true for first address and false for subsequent addresses", async () => {
      prismaMock.address.count.mockResolvedValueOnce(0);
      prismaMock.address.create.mockImplementation(async ({ data }: any) => ({ id: 1, ...data }));

      const first = await addressService.create(1, {
        city: "Cairo",
        street: "St 1",
        phone: "01000000000",
      });
      assert.equal(first.isDefault, true);

      prismaMock.address.count.mockResolvedValueOnce(1);
      const second = await addressService.create(1, {
        city: "Giza",
        street: "St 2",
        phone: "01100000000",
      });
      assert.equal(second.isDefault, false);
    });

    it("update throws 404 if not owned and unsets previous default when isDefault: true", async () => {
      prismaMock.address.findFirst.mockResolvedValueOnce(null);
      await assert.rejects(
        () => addressService.update(1, 99, { city: "Alex" }),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.address.findFirst.mockResolvedValueOnce({ id: 2, userId: 1, isDefault: false });
      prismaMock.address.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.address.update.mockResolvedValue({ id: 2, userId: 1, isDefault: true });

      const updated = await addressService.update(1, 2, { isDefault: true });
      assert.equal(updated.isDefault, true);
      assert.equal(prismaMock.address.updateMany.calls.length, 1);
      assert.deepEqual(prismaMock.address.updateMany.calls[0][0], {
        where: { userId: 1, id: { not: 2 } },
        data: { isDefault: false },
      });
    });

    it("delete throws 404 if not owned and promotes oldest remaining address when deleting default", async () => {
      prismaMock.address.findFirst.mockResolvedValueOnce(null);
      await assert.rejects(
        () => addressService.delete(1, 99),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.address.findFirst
        .mockResolvedValueOnce({ id: 1, userId: 1, isDefault: true }) // existing check
        .mockResolvedValueOnce({ id: 2, userId: 1, isDefault: false }); // oldestAddress check
      prismaMock.address.delete.mockResolvedValue({ id: 1 });
      prismaMock.address.update.mockResolvedValue({ id: 2, isDefault: true });

      const res = await addressService.delete(1, 1);
      assert.deepEqual(res, { message: "Address deleted successfully" });
      assert.equal(prismaMock.address.update.calls.length, 1);
      assert.deepEqual(prismaMock.address.update.calls[0][0], {
        where: { id: 2 },
        data: { isDefault: true },
      });
    });
  });

  describe("address.controller", () => {
    it("getAllAddresses, createAddress, updateAddress, deleteAddress return expected status codes", async () => {
      const user = { id: 1, name: "Ali", email: "a@b.c", role: "CUSTOMER" as const };
      const next = createMockNext();

      prismaMock.address.findMany.mockResolvedValue([]);
      const resGet = createMockRes();
      await getAllAddresses(createMockReq({ user }), resGet, next);
      assert.equal(resGet.statusCode, 200);

      prismaMock.address.count.mockResolvedValue(0);
      prismaMock.address.create.mockResolvedValue({ id: 1, isDefault: true });
      const resCreate = createMockRes();
      await createAddress(
        createMockReq({ user, body: { city: "Cairo", street: "St", phone: "010" } }),
        resCreate,
        next,
      );
      assert.equal(resCreate.statusCode, 201);

      prismaMock.address.findFirst.mockResolvedValue({ id: 1, userId: 1 });
      prismaMock.address.update.mockResolvedValue({ id: 1, city: "Giza" });
      const resUpdate = createMockRes();
      await updateAddress(
        createMockReq({ user, params: { id: "1" } as any, body: { city: "Giza" } }),
        resUpdate,
        next,
      );
      assert.equal(resUpdate.statusCode, 200);

      prismaMock.address.findFirst.mockResolvedValue({ id: 1, userId: 1, isDefault: false });
      prismaMock.address.delete.mockResolvedValue({ id: 1 });
      const resDel = createMockRes();
      await deleteAddress(createMockReq({ user, params: { id: "1" } as any }), resDel, next);
      assert.equal(resDel.statusCode, 200);
    });
  });
});
