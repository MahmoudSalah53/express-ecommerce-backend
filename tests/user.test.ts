import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { createMockNext, createMockReq, createMockRes, prismaMock, resetPrismaMock } from "./helpers";
import { COOKIE_NAME } from "../src/config/cookie";
import { env } from "../src/config/env";
import { createUser, getMe, loginUser, logoutUser } from "../src/controllers/user.controller";
import { userService } from "../src/services/user.service";
import { AppError } from "../src/utils/AppError";

describe("User Service & Controller", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe("userService.create", () => {
    it("hashes password and creates user with CUSTOMER role", async () => {
      prismaMock.user.create.mockImplementation(async ({ data }: any) => ({
        id: 1,
        name: data.name,
        email: data.email,
        role: data.role,
      }));

      const user = await userService.create({
        name: "Ali",
        email: "ali@test.com",
        password: "password123",
      });

      assert.deepEqual(user, {
        id: 1,
        name: "Ali",
        email: "ali@test.com",
        role: "CUSTOMER",
      });

      const createCall = prismaMock.user.create.calls[0][0];
      assert.notEqual(createCall.data.password, "password123");
      assert.equal(createCall.data.role, "CUSTOMER");
    });
  });

  describe("userService.login", () => {
    it("throws 401 when email does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await assert.rejects(
        () => userService.login({ email: "missing@test.com", password: "password123" }),
        (err: any) => err instanceof AppError && err.statusCode === 401,
      );
    });

    it("throws 401 when password does not match", async () => {
      const hashedPassword = await hash("correct-password", 4);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        name: "Ali",
        email: "ali@test.com",
        password: hashedPassword,
        role: "CUSTOMER",
      });

      await assert.rejects(
        () => userService.login({ email: "ali@test.com", password: "wrong-password" }),
        (err: any) => err instanceof AppError && err.statusCode === 401,
      );
    });

    it("returns token and user (without password) on valid credentials", async () => {
      const hashedPassword = await hash("password123", 4);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 5,
        name: "Ali",
        email: "ali@test.com",
        password: hashedPassword,
        role: "CUSTOMER",
      });

      const result = await userService.login({
        email: "ali@test.com",
        password: "password123",
      });

      assert.deepEqual(result.user, {
        id: 5,
        name: "Ali",
        email: "ali@test.com",
        role: "CUSTOMER",
      });
      const payload = jwt.verify(result.token, env.JWT_SECRET) as { userId: number };
      assert.equal(payload.userId, 5);
    });
  });

  describe("user.controller", () => {
    it("createUser responds with 201 and user data", async () => {
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        name: "Ali",
        email: "ali@test.com",
        role: "CUSTOMER",
      });

      const req = createMockReq({
        body: { name: "Ali", email: "ali@test.com", password: "password123" },
      });
      const res = createMockRes();
      const next = createMockNext();

      await createUser(req, res, next);

      assert.equal(res.statusCode, 201);
      assert.deepEqual(res.body, {
        status: "success",
        data: { id: 1, name: "Ali", email: "ali@test.com", role: "CUSTOMER" },
      });
    });

    it("loginUser throws 400 Already logged in when valid session cookie exists", async () => {
      const token = jwt.sign({ userId: 1 }, env.JWT_SECRET);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        name: "Ali",
        email: "ali@test.com",
        role: "CUSTOMER",
      });

      const req = createMockReq({
        cookies: { [COOKIE_NAME]: token },
        body: { email: "ali@test.com", password: "password123" },
      });
      const res = createMockRes();
      const next = createMockNext();

      await assert.rejects(
        async () => loginUser(req, res, next),
        (err: any) =>
          err instanceof AppError && err.statusCode === 400 && err.message === "Already logged in",
      );
    });

    it("loginUser sets HttpOnly cookie and returns 200 with user data", async () => {
      const hashedPassword = await hash("password123", 4);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 2,
        name: "Sara",
        email: "sara@test.com",
        password: hashedPassword,
        role: "CUSTOMER",
      });

      const req = createMockReq({
        cookies: {},
        body: { email: "sara@test.com", password: "password123" },
      });
      const res = createMockRes();
      const next = createMockNext();

      await loginUser(req, res, next);

      assert.equal(res.statusCode, 200);
      assert.equal(res.cookiesSet.length, 1);
      assert.equal(res.cookiesSet[0].name, COOKIE_NAME);
      assert.equal(res.cookiesSet[0].options.httpOnly, true);
      assert.deepEqual(res.body, {
        status: "success",
        data: { id: 2, name: "Sara", email: "sara@test.com", role: "CUSTOMER" },
      });
    });

    it("logoutUser clears session cookie and returns 200", async () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      await logoutUser(req, res, next);

      assert.equal(res.statusCode, 200);
      assert.equal(res.cookiesCleared.length, 1);
      assert.equal(res.cookiesCleared[0].name, COOKIE_NAME);
      assert.deepEqual(res.body, { status: "success", message: "Logged out successfully" });
    });

    it("getMe returns 200 with req.user", async () => {
      const mockUser = { id: 3, name: "Admin", email: "admin@test.com", role: "ADMIN" as const };
      const req = createMockReq({ user: mockUser });
      const res = createMockRes();
      const next = createMockNext();

      await getMe(req, res, next);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { status: "success", data: mockUser });
    });
  });
});
