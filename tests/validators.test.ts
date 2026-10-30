import assert from "node:assert/strict";
import { describe, it } from "node:test";
import "./helpers";
import {
  addressIdParamSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../src/validators/address.validator";
import {
  cartIdParamSchema,
  createCartSchema,
  updateCartItemSchema,
} from "../src/validators/cart.validator";
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../src/validators/category.validator";
import {
  couponIdParamSchema,
  createCouponSchema,
  updateCouponSchema,
} from "../src/validators/coupon.validator";
import {
  adminListOrdersQuerySchema,
  createOrderSchema,
  listOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
} from "../src/validators/order.validator";
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from "../src/validators/product.validator";
import {
  createReviewSchema,
  listReviewsQuerySchema,
  reviewIdParamSchema,
  updateReviewSchema,
} from "../src/validators/review.validator";
import {
  createUserSchema,
  loginUserSchema,
  userIdParamSchema,
} from "../src/validators/user.validator";

describe("Validators (Zod Schemas)", () => {
  describe("user.validator", () => {
    it("createUserSchema accepts valid user input and strips unknown fields like role", () => {
      const parsed = createUserSchema.safeParse({
        name: "Ali",
        email: "ali@example.com",
        password: "password123",
        role: "ADMIN",
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.deepEqual(parsed.data, {
          name: "Ali",
          email: "ali@example.com",
          password: "password123",
        });
      }
    });

    it("createUserSchema rejects short password or invalid email", () => {
      assert.equal(
        createUserSchema.safeParse({ name: "Ali", email: "bad", password: "123" }).success,
        false,
      );
    });

    it("loginUserSchema validates email and 8+ char password", () => {
      assert.equal(
        loginUserSchema.safeParse({ email: "ali@example.com", password: "password123" }).success,
        true,
      );
      assert.equal(
        loginUserSchema.safeParse({ email: "ali@example.com", password: "short" }).success,
        false,
      );
    });

    it("userIdParamSchema coerces positive integer id", () => {
      const res = userIdParamSchema.safeParse({ id: "5" });
      assert.equal(res.success, true);
      assert.equal(userIdParamSchema.safeParse({ id: "0" }).success, false);
    });
  });

  describe("category.validator", () => {
    it("createCategorySchema requires non-empty name", () => {
      assert.equal(createCategorySchema.safeParse({ name: "Electronics" }).success, true);
      assert.equal(createCategorySchema.safeParse({ name: "" }).success, false);
    });

    it("updateCategorySchema validates slug format", () => {
      assert.equal(updateCategorySchema.safeParse({ slug: "mobile-phones-2" }).success, true);
      assert.equal(updateCategorySchema.safeParse({ slug: "Invalid Slug!" }).success, false);
    });

    it("updateCategorySchema should reject empty object {}", () => {
      assert.equal(updateCategorySchema.safeParse({}).success, false);
    });

    it("categoryIdParamSchema coerces positive integer", () => {
      assert.equal(categoryIdParamSchema.safeParse({ id: "10" }).success, true);
      assert.equal(categoryIdParamSchema.safeParse({ id: "-1" }).success, false);
    });
  });

  describe("product.validator", () => {
    it("createProductSchema accepts valid product and rejects negative price or stock", () => {
      assert.equal(
        createProductSchema.safeParse({
          name: "Laptop",
          description: "Fast laptop",
          price: 999.99,
          stock: 5,
          categoryId: 1,
        }).success,
        true,
      );

      assert.equal(
        createProductSchema.safeParse({
          name: "Laptop",
          description: "Fast laptop",
          price: -1,
          stock: 5,
          categoryId: 1,
        }).success,
        false,
      );

      assert.equal(
        createProductSchema.safeParse({
          name: "Laptop",
          description: "Fast laptop",
          price: 100,
          stock: -2,
          categoryId: 1,
        }).success,
        false,
      );
    });

    it("updateProductSchema rejects empty object {} and accepts partial fields", () => {
      assert.equal(updateProductSchema.safeParse({}).success, false);
      assert.equal(updateProductSchema.safeParse({ stock: 20 }).success, true);
    });

    it("listProductsQuerySchema enforces limit <= 100 and minPrice <= maxPrice", () => {
      const defaults = listProductsQuerySchema.parse({});
      assert.equal(defaults.page, 1);
      assert.equal(defaults.limit, 10);
      assert.equal(defaults.includeInactive, "false");

      assert.equal(listProductsQuerySchema.safeParse({ limit: 1000 }).success, false);
      assert.equal(
        listProductsQuerySchema.safeParse({ minPrice: 500, maxPrice: 100 }).success,
        false,
      );
      assert.equal(
        listProductsQuerySchema.safeParse({ minPrice: 100, maxPrice: 500 }).success,
        true,
      );
    });

    it("productIdParamSchema rejects non-numeric id", () => {
      assert.equal(productIdParamSchema.safeParse({ id: "abc" }).success, false);
    });
  });

  describe("cart.validator", () => {
    it("createCartSchema enforces quantity integer between 1 and 99", () => {
      assert.equal(createCartSchema.safeParse({ productId: 1, quantity: 2 }).success, true);
      assert.equal(createCartSchema.safeParse({ productId: 1, quantity: 0 }).success, false);
      assert.equal(createCartSchema.safeParse({ productId: 1, quantity: 100 }).success, false);
      assert.equal(createCartSchema.safeParse({ productId: 1, quantity: 1.5 }).success, false);
    });

    it("updateCartItemSchema and cartIdParamSchema validate properly", () => {
      assert.equal(updateCartItemSchema.safeParse({ quantity: 5 }).success, true);
      assert.equal(updateCartItemSchema.safeParse({ quantity: 0 }).success, false);
      assert.equal(cartIdParamSchema.safeParse({ id: "3" }).success, true);
    });
  });

  describe("address.validator", () => {
    it("createAddressSchema requires city, street, and phone", () => {
      assert.equal(
        createAddressSchema.safeParse({
          city: "Cairo",
          street: "12 Tahrir St",
          phone: "01012345678",
        }).success,
        true,
      );
      assert.equal(createAddressSchema.safeParse({ city: "Cairo" }).success, false);
    });

    it("updateAddressSchema rejects empty body {} and accepts isDefault", () => {
      assert.equal(updateAddressSchema.safeParse({}).success, false);
      assert.equal(updateAddressSchema.safeParse({ isDefault: true }).success, true);
      assert.equal(addressIdParamSchema.safeParse({ id: "1" }).success, true);
    });
  });

  describe("order.validator", () => {
    it("createOrderSchema defaults to {} and uppercases couponCode", () => {
      assert.deepEqual(createOrderSchema.parse(undefined), {});
      const parsed = createOrderSchema.parse({ addressId: "2", couponCode: " save10 " });
      assert.deepEqual(parsed, { addressId: 2, couponCode: "SAVE10" });
    });

    it("listOrdersQuerySchema, adminListOrdersQuerySchema, updateOrderStatusSchema, orderIdParamSchema", () => {
      assert.deepEqual(listOrdersQuerySchema.parse({}), { page: 1, limit: 10 });
      assert.equal(
        adminListOrdersQuerySchema.safeParse({ status: "PENDING" }).success,
        true,
      );
      assert.equal(
        adminListOrdersQuerySchema.safeParse({ status: "UNKNOWN" }).success,
        false,
      );
      assert.equal(updateOrderStatusSchema.safeParse({ status: "SHIPPED" }).success, true);
      assert.equal(orderIdParamSchema.safeParse({ id: "9" }).success, true);
    });
  });

  describe("review.validator", () => {
    it("createReviewSchema enforces rating 1..5 and optional trimmed comment", () => {
      assert.equal(createReviewSchema.safeParse({ rating: 5, comment: "Great!" }).success, true);
      assert.equal(createReviewSchema.safeParse({ rating: 0 }).success, false);
      assert.equal(createReviewSchema.safeParse({ rating: 6 }).success, false);
    });

    it("updateReviewSchema rejects empty object and allows nullable comment", () => {
      assert.equal(updateReviewSchema.safeParse({}).success, false);
      assert.equal(updateReviewSchema.safeParse({ comment: null }).success, true);
      assert.equal(listReviewsQuerySchema.safeParse({}).success, true);
      assert.equal(reviewIdParamSchema.safeParse({ id: "4" }).success, true);
    });
  });

  describe("coupon.validator", () => {
    it("createCouponSchema uppercases code, enforces percent 1..80, and requires future date", () => {
      const future = new Date(Date.now() + 86400_000).toISOString();
      const past = new Date(Date.now() - 86400_000).toISOString();

      const valid = createCouponSchema.safeParse({
        code: "save10",
        percent: 10,
        expiresAt: future,
        usageLimit: 50,
      });
      assert.equal(valid.success, true);
      if (valid.success) {
        assert.equal(valid.data.code, "SAVE10");
      }

      assert.equal(
        createCouponSchema.safeParse({
          code: "save90",
          percent: 90,
          expiresAt: future,
          usageLimit: 10,
        }).success,
        false,
      );

      assert.equal(
        createCouponSchema.safeParse({
          code: "save10",
          percent: 10,
          expiresAt: past,
          usageLimit: 10,
        }).success,
        false,
      );
    });

    it("updateCouponSchema rejects empty body {} and couponIdParamSchema validates id", () => {
      assert.equal(updateCouponSchema.safeParse({}).success, false);
      assert.equal(updateCouponSchema.safeParse({ isActive: false }).success, true);
      assert.equal(couponIdParamSchema.safeParse({ id: "2" }).success, true);
    });
  });
});
