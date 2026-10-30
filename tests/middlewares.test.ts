import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createMockNext, createMockReq, createMockRes, prismaMock, resetPrismaMock } from "./helpers";
import { COOKIE_NAME } from "../src/config/cookie";
import { env } from "../src/config/env";
import { getAuthUser, requireAdmin, requireAuth } from "../src/middlewares/auth.middleware";
import { errorHandler } from "../src/middlewares/error.middleware";
import { notFound } from "../src/middlewares/notFound.middleware";
import { validate } from "../src/middlewares/validate.middleware";
import { AppError } from "../src/utils/AppError";

describe("Middlewares", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("auth.middleware: getAuthUser, requireAuth, requireAdmin", () => {
    it("getAuthUser returns null when cookie is missing", async () => {
      const req = createMockReq({ cookies: {} });
      const user = await getAuthUser(req);
      assert.equal(user, null);
    });

    it("getAuthUser returns null when token is invalid", async () => {
      const req = createMockReq({ cookies: { [COOKIE_NAME]: "invalid.token.here" } });
      const user = await getAuthUser(req);
      assert.equal(user, null);
    });

    it("getAuthUser returns user from database when token is valid", async () => {
      const token = jwt.sign({ userId: 7 }, env.JWT_SECRET);
      const mockUser = { id: 7, name: "Mahmoud", email: "m@test.com", role: "CUSTOMER" };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const req = createMockReq({ cookies: { [COOKIE_NAME]: token } });
      const user = await getAuthUser(req);

      assert.deepEqual(user, mockUser);
      assert.equal(prismaMock.user.findUnique.calls.length, 1);
    });

    it("requireAuth calls next with 401 AppError when not authenticated", async () => {
      const req = createMockReq({ cookies: {} });
      const res = createMockRes();
      const next = createMockNext();

      await requireAuth(req, res, next);

      assert.equal(next.calls.length, 1);
      assert.equal(next.calls[0] instanceof AppError, true);
      assert.equal(next.calls[0].statusCode, 401);
      assert.equal(next.calls[0].message, "Unauthorized");
    });

    it("requireAuth attaches req.user and calls next() when authenticated", async () => {
      const token = jwt.sign({ userId: 1 }, env.JWT_SECRET);
      const mockUser = { id: 1, name: "Ali", email: "ali@test.com", role: "CUSTOMER" };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const req = createMockReq({ cookies: { [COOKIE_NAME]: token } });
      const res = createMockRes();
      const next = createMockNext();

      await requireAuth(req, res, next);

      assert.deepEqual(req.user, mockUser);
      assert.equal(next.calls.length, 1);
      assert.equal(next.calls[0], undefined);
    });

    it("requireAdmin calls next with 403 AppError when user is CUSTOMER", () => {
      const req = createMockReq({
        user: { id: 1, name: "Ali", email: "ali@test.com", role: "CUSTOMER" },
      });
      const res = createMockRes();
      const next = createMockNext();

      requireAdmin(req, res, next);

      assert.equal(next.calls.length, 1);
      assert.equal(next.calls[0] instanceof AppError, true);
      assert.equal(next.calls[0].statusCode, 403);
      assert.equal(next.calls[0].message, "Forbidden");
    });

    it("requireAdmin calls next() when user is ADMIN", () => {
      const req = createMockReq({
        user: { id: 1, name: "Admin", email: "admin@test.com", role: "ADMIN" },
      });
      const res = createMockRes();
      const next = createMockNext();

      requireAdmin(req, res, next);

      assert.equal(next.calls.length, 1);
      assert.equal(next.calls[0], undefined);
    });
  });

  describe("validate.middleware", () => {
    it("parses and coerces body, query, and params then calls next()", () => {
      const middleware = validate({
        body: z.object({ name: z.string().trim() }),
        query: z.object({ page: z.coerce.number().default(1) }),
        params: z.object({ id: z.coerce.number() }),
      });

      const req = createMockReq({
        body: { name: "  Phone  " },
        query: { page: "3" } as any,
        params: { id: "42" } as any,
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      assert.deepEqual(req.body, { name: "Phone" });
      assert.deepEqual(req.query, { page: 3 });
      assert.deepEqual(req.params, { id: 42 });
      assert.equal(next.calls.length, 1);
      assert.equal(next.calls[0], undefined);
    });

    it("throws ZodError when validation fails", () => {
      const middleware = validate({
        body: z.object({ email: z.string().email() }),
      });

      const req = createMockReq({ body: { email: "not-an-email" } });
      const res = createMockRes();
      const next = createMockNext();

      assert.throws(() => middleware(req, res, next), z.ZodError);
    });
  });

  describe("notFound.middleware", () => {
    it("forwards 404 AppError with method and originalUrl", () => {
      const req = createMockReq({ method: "POST", originalUrl: "/api/unknown" });
      const res = createMockRes();
      const next = createMockNext();

      notFound(req, res, next);

      assert.equal(next.calls.length, 1);
      assert.equal(next.calls[0] instanceof AppError, true);
      assert.equal(next.calls[0].statusCode, 404);
      assert.equal(next.calls[0].message, "Route not found: POST /api/unknown");
    });
  });

  describe("error.middleware", () => {
    it("returns 400 for malformed JSON body (entity.parse.failed)", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler({ type: "entity.parse.failed" }, req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { status: "error", message: "Invalid JSON body" });
    });

    it("returns 413 for oversized body (entity.too.large)", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler({ type: "entity.too.large" }, req, res, next);

      assert.equal(res.statusCode, 413);
      assert.deepEqual(res.body, { status: "error", message: "Request body is too large" });
    });

    it("returns 400 with fieldErrors for ZodError", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      const result = z.object({ name: z.string().min(3) }).safeParse({ name: "a" });
      assert.equal(result.success, false);

      errorHandler(result.error, req, res, next);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.status, "error");
      assert.equal(res.body.message, "Validation failed");
      assert.ok(res.body.errors.name);
    });

    it("returns 409 for Prisma P2002 unique constraint violation", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      const prismaErr = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.0.0",
      });

      errorHandler(prismaErr, req, res, next);

      assert.equal(res.statusCode, 409);
      assert.deepEqual(res.body, {
        status: "error",
        message: "A record with this value already exists",
      });
    });

    it("returns custom statusCode and message for AppError", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(new AppError("Product not found", 404), req, res, next);

      assert.equal(res.statusCode, 404);
      assert.deepEqual(res.body, { status: "error", message: "Product not found" });
    });

    it("returns 500 Internal server error for unexpected Error", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      errorHandler(new Error("Database exploded"), req, res, next);

      assert.equal(res.statusCode, 500);
      assert.equal(res.body.status, "error");
      assert.equal(res.body.message, "Internal server error");
    });
  });
});
