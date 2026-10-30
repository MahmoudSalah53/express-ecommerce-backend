import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMockNext, createMockReq, createMockRes } from "./helpers";
import { AppError } from "../src/utils/AppError";
import { asyncHandler } from "../src/utils/asyncHandler";

describe("Utils: AppError & asyncHandler", () => {
  describe("AppError", () => {
    it("creates an operational error with custom statusCode", () => {
      const err = new AppError("Not found", 404);
      assert.equal(err instanceof Error, true);
      assert.equal(err instanceof AppError, true);
      assert.equal(err.message, "Not found");
      assert.equal(err.statusCode, 404);
      assert.equal(err.isOperational, true);
    });

    it("defaults statusCode to 500 when omitted", () => {
      const err = new AppError("Server boom");
      assert.equal(err.statusCode, 500);
      assert.equal(err.message, "Server boom");
    });
  });

  describe("asyncHandler", () => {
    it("executes resolved async handler without calling next(err)", async () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      const wrapped = asyncHandler(async (_req, response) => {
        response.status(200).json({ ok: true });
      });

      await wrapped(req, res, next);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { ok: true });
      assert.equal(next.calls.length, 0);
    });

    it("catches rejected promises and forwards error to next()", async () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();
      const expectedError = new AppError("Async failure", 422);

      const wrapped = asyncHandler(async () => {
        throw expectedError;
      });

      await wrapped(req, res, next);
      await new Promise((r) => setImmediate(r));

      assert.equal(next.calls.length, 1);
      assert.equal(next.calls[0], expectedError);
    });
  });
});
