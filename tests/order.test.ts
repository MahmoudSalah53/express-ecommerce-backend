import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { Prisma } from "@prisma/client";
import { createMockNext, createMockReq, createMockRes, prismaMock, resetPrismaMock } from "./helpers";
import {
  adminListOrders,
  cancelOrder,
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../src/controllers/order.controller";
import { orderService, restoreStock } from "../src/services/order.service";
import { AppError } from "../src/utils/AppError";

describe("Order Service & Controller", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("restoreStock", () => {
    it("increments stock for every item in the order", async () => {
      prismaMock.orderItem.findMany.mockResolvedValue([
        { productId: 10, quantity: 2 },
        { productId: 20, quantity: 1 },
      ]);
      prismaMock.product.update.mockResolvedValue({});

      await restoreStock(prismaMock as any, 55);

      assert.equal(prismaMock.product.update.calls.length, 2);
      assert.deepEqual(prismaMock.product.update.calls[0][0], {
        where: { id: 10 },
        data: { stock: { increment: 2 } },
      });
    });
  });

  describe("orderService.create", () => {
    it("throws 400 when user has no default address, or 404 when specified addressId is not found", async () => {
      prismaMock.address.findFirst.mockResolvedValueOnce(null);
      await assert.rejects(
        () => orderService.create(1, {}),
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 400 &&
          err.message === "Add an address before placing an order",
      );

      prismaMock.address.findFirst.mockResolvedValueOnce(null);
      await assert.rejects(
        () => orderService.create(1, { addressId: 99 }),
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.message === "Address not found",
      );
    });

    it("throws 400 when cart is empty or contains an inactive product", async () => {
      prismaMock.address.findFirst.mockResolvedValue({
        id: 1,
        city: "Cairo",
        street: "St",
        phone: "010",
      });

      prismaMock.cart.findUnique.mockResolvedValueOnce({ id: 1, items: [] });
      await assert.rejects(
        () => orderService.create(1, {}),
        (err: any) =>
          err instanceof AppError && err.statusCode === 400 && err.message === "Cart is empty",
      );

      prismaMock.cart.findUnique.mockResolvedValueOnce({
        id: 1,
        items: [
          {
            productId: 10,
            quantity: 1,
            product: { id: 10, name: "Old Phone", price: new Prisma.Decimal(100), isActive: false },
          },
        ],
      });
      await assert.rejects(
        () => orderService.create(1, {}),
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 400 &&
          err.message.includes("Old Phone is no longer available"),
      );
    });

    it("throws 400 when atomic stock decrement fails (count === 0)", async () => {
      prismaMock.address.findFirst.mockResolvedValue({
        id: 1,
        city: "Cairo",
        street: "St",
        phone: "010",
      });
      prismaMock.cart.findUnique.mockResolvedValue({
        id: 1,
        items: [
          {
            productId: 10,
            quantity: 3,
            product: { id: 10, name: "Phone", price: new Prisma.Decimal(100), isActive: true },
          },
        ],
      });
      prismaMock.product.updateMany.mockResolvedValue({ count: 0 });

      await assert.rejects(
        () => orderService.create(1, {}),
        (err: any) =>
          err instanceof AppError &&
          err.statusCode === 400 &&
          err.message === "Not enough stock for Phone",
      );
    });

    it("creates order with coupon discount, decrements stock, increments coupon usedCount, and clears cart", async () => {
      prismaMock.address.findFirst.mockResolvedValue({
        id: 1,
        city: "Cairo",
        street: "12 Tahrir",
        phone: "010123",
      });
      prismaMock.cart.findUnique.mockResolvedValue({
        id: 5,
        items: [
          {
            productId: 10,
            quantity: 2,
            product: { id: 10, name: "Phone", price: new Prisma.Decimal(100), isActive: true },
          },
        ],
      });
      prismaMock.product.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.coupon.findUnique.mockResolvedValue({
        id: 3,
        code: "SAVE10",
        percent: 10,
        usageLimit: 100,
        usedCount: 0,
      });
      prismaMock.coupon.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.order.create.mockImplementation(async ({ data }: any) => ({
        id: 100,
        status: "PENDING",
        ...data,
      }));
      prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      const order = await orderService.create(1, { couponCode: "SAVE10" });

      assert.equal(order.subtotal.toString(), "200");
      assert.equal(order.discount.toString(), "20");
      assert.equal(order.total.toString(), "180");
      assert.equal(order.couponCode, "SAVE10");
      assert.equal(order.shippingCity, "Cairo");
      assert.equal(prismaMock.cartItem.deleteMany.calls.length, 1);
    });
  });

  describe("orderService.cancel & updateStatus & list & getById & adminList", () => {
    it("cancel cancels PENDING order and restores stock; throws 400 for non-PENDING or 404 if missing", async () => {
      prismaMock.order.updateMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.orderItem.findMany.mockResolvedValueOnce([{ productId: 10, quantity: 2 }]);
      prismaMock.product.update.mockResolvedValueOnce({});
      prismaMock.order.findUniqueOrThrow.mockResolvedValueOnce({ id: 1, status: "CANCELLED" });

      const cancelled = await orderService.cancel(1, 1);
      assert.equal(cancelled.status, "CANCELLED");

      prismaMock.order.updateMany.mockResolvedValueOnce({ count: 0 });
      prismaMock.order.findFirst.mockResolvedValueOnce({ id: 1, status: "SHIPPED" });
      await assert.rejects(
        () => orderService.cancel(1, 1),
        (err: any) => err instanceof AppError && err.statusCode === 400,
      );

      prismaMock.order.updateMany.mockResolvedValueOnce({ count: 0 });
      prismaMock.order.findFirst.mockResolvedValueOnce(null);
      await assert.rejects(
        () => orderService.cancel(1, 999),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );
    });

    it("updateStatus enforces allowed transitions (PENDING -> SHIPPED -> DELIVERED, PENDING -> CANCELLED)", async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce({ id: 1, status: "PENDING" });
      await assert.rejects(
        () => orderService.updateStatus(1, { status: "DELIVERED" }),
        (err: any) => err instanceof AppError && err.statusCode === 400,
      );

      prismaMock.order.findUnique.mockResolvedValueOnce({ id: 1, status: "DELIVERED" });
      await assert.rejects(
        () => orderService.updateStatus(1, { status: "CANCELLED" }),
        (err: any) => err instanceof AppError && err.statusCode === 400,
      );

      prismaMock.order.findUnique.mockResolvedValueOnce({ id: 1, status: "PENDING" });
      prismaMock.order.updateMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.orderItem.findMany.mockResolvedValueOnce([{ productId: 10, quantity: 1 }]);
      prismaMock.product.update.mockResolvedValueOnce({});
      prismaMock.order.findUniqueOrThrow.mockResolvedValueOnce({ id: 1, status: "CANCELLED" });

      const updated = await orderService.updateStatus(1, { status: "CANCELLED" });
      assert.equal(updated.status, "CANCELLED");
      assert.equal(prismaMock.product.update.calls.length, 1);
    });

    it("list, getById, and adminList query orders properly", async () => {
      prismaMock.order.findMany.mockResolvedValue([{ id: 1 }]);
      prismaMock.order.count.mockResolvedValue(1);

      const userOrders = await orderService.list(1, { page: 1, limit: 10 });
      assert.equal(userOrders.total, 1);

      const adminOrders = await orderService.adminList({
        page: 1,
        limit: 10,
        status: "PENDING",
      });
      assert.equal(adminOrders.total, 1);

      prismaMock.order.findFirst.mockResolvedValueOnce({ id: 1, userId: 1 });
      const single = await orderService.getById(1, 1);
      assert.equal(single.id, 1);

      prismaMock.order.findFirst.mockResolvedValueOnce(null);
      await assert.rejects(
        () => orderService.getById(1, 99),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );
    });
  });

  describe("order.controller", () => {
    it("createOrder, listOrders, getOrderById, cancelOrder, adminListOrders, updateOrderStatus return expected responses", async () => {
      const user = { id: 1, name: "Ali", email: "a@b.c", role: "ADMIN" as const };
      const next = createMockNext();

      prismaMock.order.findMany.mockResolvedValue([{ id: 1 }]);
      prismaMock.order.count.mockResolvedValue(1);

      const resList = createMockRes();
      await listOrders(
        createMockReq({ user, query: { page: 1, limit: 10 } as any }),
        resList,
        next,
      );
      assert.equal(resList.statusCode, 200);

      const resAdminList = createMockRes();
      await adminListOrders(
        createMockReq({ user, query: { page: 1, limit: 10 } as any }),
        resAdminList,
        next,
      );
      assert.equal(resAdminList.statusCode, 200);

      prismaMock.order.findFirst.mockResolvedValue({ id: 1, userId: 1 });
      const resGet = createMockRes();
      await getOrderById(createMockReq({ user, params: { id: "1" } as any }), resGet, next);
      assert.equal(resGet.statusCode, 200);

      prismaMock.order.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.orderItem.findMany.mockResolvedValue([]);
      prismaMock.order.findUniqueOrThrow.mockResolvedValue({ id: 1, status: "CANCELLED" });
      const resCancel = createMockRes();
      await cancelOrder(createMockReq({ user, params: { id: "1" } as any }), resCancel, next);
      assert.equal(resCancel.statusCode, 200);

      prismaMock.order.findUnique.mockResolvedValue({ id: 1, status: "PENDING" });
      prismaMock.order.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.order.findUniqueOrThrow.mockResolvedValue({ id: 1, status: "SHIPPED" });
      const resStatus = createMockRes();
      await updateOrderStatus(
        createMockReq({ user, params: { id: "1" } as any, body: { status: "SHIPPED" } }),
        resStatus,
        next,
      );
      assert.equal(resStatus.statusCode, 200);

      prismaMock.address.findFirst.mockResolvedValue({
        id: 1,
        city: "Cairo",
        street: "St",
        phone: "010",
      });
      prismaMock.cart.findUnique.mockResolvedValue({
        id: 1,
        items: [
          {
            productId: 10,
            quantity: 1,
            product: { id: 10, name: "Phone", price: new Prisma.Decimal(50), isActive: true },
          },
        ],
      });
      prismaMock.product.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.order.create.mockResolvedValue({ id: 1, status: "PENDING" });
      prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      const resCreate = createMockRes();
      await createOrder(createMockReq({ user, body: {} }), resCreate, next);
      assert.equal(resCreate.statusCode, 201);
    });
  });
});
