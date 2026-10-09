import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "../config/cookie";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function getAuthUser(req: Request) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token || typeof token !== "string") return null;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: number };
    return prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch {
    return null;
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const user = await getAuthUser(req);
  if (!user) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  req.user = user;
  next();
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "ADMIN") {
    next(new AppError("Forbidden", 403));
    return;
  }

  next();
};
