import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMockNext, createMockReq, createMockRes } from "./helpers";
import { getHealth } from "../src/controllers/health.controller";
import { apiRouter } from "../src/routes";

describe("Health Controller & API Routes Mounting", () => {
  it("getHealth returns { status: 'ok' }", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    getHealth(req, res, next);
    assert.deepEqual(res.body, { status: "ok" });
  });

  it("apiRouter mounts all expected route prefixes according to STORIES.md", () => {
    const mountedSources = apiRouter.stack.map((layer: any) => layer.regexp?.source ?? "");

    assert.ok(mountedSources.some((s: string) => s.includes("health")), "health route mounted");
    assert.ok(mountedSources.some((s: string) => s.includes("users")), "users route mounted");
    assert.ok(mountedSources.some((s: string) => s.includes("products")), "products route mounted");
    assert.ok(
      mountedSources.some((s: string) => s.includes("categories")),
      "categories route mounted",
    );
    assert.ok(mountedSources.some((s: string) => s.includes("cart")), "cart route mounted");
    assert.ok(mountedSources.some((s: string) => s.includes("orders")), "orders route mounted");
    assert.ok(mountedSources.some((s: string) => s.includes("reviews")), "reviews route mounted");
    assert.ok(
      mountedSources.some((s: string) => s.includes("admin\\/coupons")),
      "admin/coupons route mounted",
    );
    assert.ok(
      mountedSources.some((s: string) => s.includes("addresses")),
      "addresses route should be mounted at /api/addresses per STORIES.md",
    );
  });
});
