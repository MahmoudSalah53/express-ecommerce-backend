import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { Prisma } from "@prisma/client";
import { createMockNext, createMockReq, createMockRes, prismaMock, resetPrismaMock } from "./helpers";
import {
  clearCart,
  createCart,
  deleteCartItem,
  getCart,
  updateCartItem,
} from "../src/controllers/cart.controller";
import { cartService } from "../src/services/cart.service";
import { AppError } from "../src/utils/AppError";

describe("Cart Service & Controller", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("cartService.getCart", () => {
    it("returns empty items and 0 subtotal when user has no cart yet", async () => {
      prismaMock.cart.findUnique.mockResolvedValue(null);
      const res = await cartService.getCart(1);
      assert.deepEqual(res.items, []);
      assert.equal(res.subtotal.toString(), "0");
    });

    it("calculates subtotal using only active products while still returning inactive items", async () => {
      prismaMock.cart.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        items: [
          {
            id: 10,
            quantity: 2,
            product: {
              id: 100,
              name: "Active Phone",
              price: new Prisma.Decimal(150),
              imageUrl: null,
              stock: 10,
              isActive: true,
            },
          },
          {
            id: 11,
            quantity: 3,
            product: {
              id: 101,
              name: "Hidden Case",
              price: new Prisma.Decimal(50),
              imageUrl: null,
              stock: 10,
              isActive: false,
            },
          },
        ],
      });

      const res = await cartService.getCart(1);
      assert.equal(res.items.length, 2);
      assert.equal(res.subtotal.toString(), "300");
    });
  });

  describe("cartService.create", () => {
    it("throws 404 when product is missing or inactive", async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);
      await assert.rejects(
        () => cartService.create(1, 99, 1),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.product.findUnique.mockResolvedValueOnce({ id: 99, stock: 10, isActive: false });
      await assert.rejects(
        () => cartService.create(1, 99, 1),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );
    });

    it("accumulates quantity when item already exists and throws 400 when total exceeds stock", async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: 10, stock: 5, isActive: true });
      prismaMock.cart.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      prismaMock.cartItem.findUnique.mockResolvedValue({ id: 50, cartId: 1, productId: 10, quantity: 3 });

      await assert.rejects(
        () => cartService.create(1, 10, 3), // 3 + 3 = 6 > stock (5)
        (err: any) =>
          err instanceof AppError && err.statusCode === 400 && err.message === "Not enough stock",
      );

      prismaMock.cartItem.update.mockResolvedValue({ id: 50, cartId: 1, productId: 10, quantity: 5 });
      const updated = await cartService.create(1, 10, 2); // 3 + 2 = 5 <= 5
      assert.equal(updated.quantity, 5);
    });

    it("creates cart and cartItem when adding first item", async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: 10, stock: 5, isActive: true });
      prismaMock.cart.findUnique.mockResolvedValue(null);
      prismaMock.cart.create.mockResolvedValue({ id: 1, userId: 1 });
      prismaMock.cartItem.create.mockResolvedValue({ id: 50, cartId: 1, productId: 10, quantity: 2 });

      const created = await cartService.create(1, 10, 2);
      assert.equal(created.quantity, 2);
      assert.equal(prismaMock.cart.create.calls.length, 1);
    });
  });

  describe("cartService.updateItem, deleteItem, clearCart", () => {
    it("updateItem throws 404 for another user's item, 400 if > stock, and replaces quantity", async () => {
      prismaMock.cartItem.findUnique.mockResolvedValueOnce({
        id: 1,
        cart: { userId: 2 },
        product: { stock: 10 },
      });
      await assert.rejects(
        () => cartService.updateItem(1, 1, 2),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.cartItem.findUnique.mockResolvedValueOnce({
        id: 1,
        cart: { userId: 1 },
        product: { stock: 3 },
      });
      await assert.rejects(
        () => cartService.updateItem(1, 1, 5),
        (err: any) => err instanceof AppError && err.statusCode === 400,
      );

      prismaMock.cartItem.findUnique.mockResolvedValueOnce({
        id: 1,
        cart: { userId: 1 },
        product: { stock: 10 },
      });
      prismaMock.cartItem.update.mockResolvedValue({ id: 1, quantity: 4 });
      const updated = await cartService.updateItem(1, 1, 4);
      assert.equal(updated.quantity, 4);
    });

    it("deleteItem throws 404 for another user's item and deletes owned item", async () => {
      prismaMock.cartItem.findUnique.mockResolvedValueOnce({
        id: 1,
        cart: { userId: 99 },
      });
      await assert.rejects(
        () => cartService.deleteItem(1, 1),
        (err: any) => err instanceof AppError && err.statusCode === 404,
      );

      prismaMock.cartItem.findUnique.mockResolvedValueOnce({
        id: 1,
        cart: { userId: 1 },
      });
      prismaMock.cartItem.delete.mockResolvedValue({ id: 1 });
      const deleted = await cartService.deleteItem(1, 1);
      assert.equal(deleted.id, 1);
    });

    it("clearCart deletes all cart items for the user", async () => {
      prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 2 });
      const res = await cartService.clearCart(1);
      assert.deepEqual(res, { count: 2 });
    });
  });

  describe("cart.controller", () => {
    it("getCart, createCart, updateCartItem, deleteCartItem, clearCart return expected status codes", async () => {
      const user = { id: 1, name: "Ali", email: "a@b.c", role: "CUSTOMER" as const };
      const next = createMockNext();

      prismaMock.cart.findUnique.mockResolvedValue(null);
      const resGet = createMockRes();
      await getCart(createMockReq({ user }), resGet, next);
      assert.equal(resGet.statusCode, 200);

      prismaMock.product.findUnique.mockResolvedValue({ id: 10, stock: 5, isActive: true });
      prismaMock.cart.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      prismaMock.cartItem.findUnique.mockResolvedValue(null);
      prismaMock.cartItem.create.mockResolvedValue({ id: 1, quantity: 2 });
      const resCreate = createMockRes();
      await createCart(
        createMockReq({ user, body: { productId: 10, quantity: 2 } }),
        resCreate,
        next,
      );
      assert.equal(resCreate.statusCode, 201);

      prismaMock.cartItem.findUnique.mockResolvedValue({
        id: 1,
        cart: { userId: 1 },
        product: { stock: 10 },
      });
      prismaMock.cartItem.update.mockResolvedValue({ id: 1, quantity: 3 });
      const resUpdate = createMockRes();
      await updateCartItem(
        createMockReq({ user, params: { id: "1" } as any, body: { quantity: 3 } }),
        resUpdate,
        next,
      );
      assert.equal(resUpdate.statusCode, 200);

      prismaMock.cartItem.findUnique.mockResolvedValue({ id: 1, cart: { userId: 1 } });
      prismaMock.cartItem.delete.mockResolvedValue({ id: 1 });
      const resDel = createMockRes();
      await deleteCartItem(createMockReq({ user, params: { id: "1" } as any }), resDel, next);
      assert.equal(resDel.statusCode, 200);

      prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      const resClear = createMockRes();
      await clearCart(createMockReq({ user }), resClear, next);
      assert.equal(resClear.statusCode, 200);
    });
  });
});
