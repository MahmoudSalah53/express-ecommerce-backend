process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "3000";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/test_db?schema=public";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
process.env.LOG_LEVEL = "fatal";
process.env.JWT_SECRET = process.env.JWT_SECRET || "unit-test-secret-key";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

import type { NextFunction, Request, Response } from "express";

type AsyncMock = ((...args: any[]) => any) & {
  calls: any[][];
  mockResolvedValue: (val: any) => void;
  mockResolvedValueOnce: (val: any) => void;
  mockImplementation: (fn: (...args: any[]) => any) => void;
  reset: () => void;
};

export function createMockFn(defaultImpl?: (...args: any[]) => any): AsyncMock {
  let impl = defaultImpl ?? (async () => undefined);
  const onceQueue: ((...args: any[]) => any)[] = [];
  const fn = ((...args: any[]) => {
    fn.calls.push(args);
    if (onceQueue.length > 0) {
      const nextFn = onceQueue.shift()!;
      return nextFn(...args);
    }
    return impl(...args);
  }) as AsyncMock;

  fn.calls = [];
  fn.mockResolvedValue = (val: any) => {
    impl = async () => val;
    return fn;
  };
  fn.mockResolvedValueOnce = (val: any) => {
    onceQueue.push(async () => val);
    return fn;
  };
  fn.mockImplementation = (newImpl: (...args: any[]) => any) => {
    impl = newImpl;
    return fn;
  };
  fn.reset = () => {
    fn.calls = [];
    onceQueue.length = 0;
    impl = defaultImpl ?? (async () => undefined);
  };

  return fn;
}

function createModelMock(extra: Record<string, any> = {}) {
  return {
    findUnique: createMockFn(),
    findUniqueOrThrow: createMockFn(),
    findFirst: createMockFn(),
    findMany: createMockFn(),
    create: createMockFn(),
    update: createMockFn(),
    updateMany: createMockFn(),
    delete: createMockFn(),
    deleteMany: createMockFn(),
    count: createMockFn(),
    aggregate: createMockFn(),
    ...extra,
  };
}

export const prismaMock = {
  user: createModelMock(),
  category: createModelMock(),
  product: createModelMock(),
  cart: createModelMock(),
  cartItem: createModelMock(),
  address: createModelMock(),
  order: createModelMock(),
  orderItem: createModelMock(),
  review: createModelMock(),
  coupon: createModelMock({ fields: { usageLimit: "usageLimit_ref" } }),
  $transaction: createMockFn(async (arg: any) => {
    if (typeof arg === "function") {
      return arg(prismaMock);
    }
    return Promise.all(arg);
  }),
};

export function resetPrismaMock() {
  for (const key of Object.keys(prismaMock) as (keyof typeof prismaMock)[]) {
    const entry = prismaMock[key] as any;
    if (typeof entry?.reset === "function") {
      entry.reset();
    } else if (entry && typeof entry === "object") {
      for (const method of Object.values(entry) as any[]) {
        if (typeof method?.reset === "function") {
          method.reset();
        }
      }
    }
  }
}

(globalThis as any).prisma = prismaMock;

export function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    cookies: {},
    headers: {},
    method: "GET",
    originalUrl: "/api/test",
    ...overrides,
  } as unknown as Request;
}

export function createMockRes() {
  const res: any = {
    statusCode: 200,
    body: undefined as any,
    cookiesSet: [] as { name: string; value: string; options: any }[],
    cookiesCleared: [] as { name: string; options: any }[],
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: any) {
      res.body = payload;
      return res;
    },
    cookie(name: string, value: string, options?: any) {
      res.cookiesSet.push({ name, value, options });
      return res;
    },
    clearCookie(name: string, options?: any) {
      res.cookiesCleared.push({ name, options });
      return res;
    },
  };
  return res as Response & {
    statusCode: number;
    body: any;
    cookiesSet: { name: string; value: string; options: any }[];
    cookiesCleared: { name: string; options: any }[];
  };
}

export function createMockNext() {
  const calls: any[] = [];
  const next = ((err?: any) => {
    calls.push(err);
  }) as NextFunction & { calls: any[] };
  next.calls = calls;
  return next;
}
