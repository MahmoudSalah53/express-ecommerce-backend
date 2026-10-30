import { CookieOptions } from "express";
import { env } from "./env";

export const COOKIE_NAME = "login-e-commerce";

// Browsers reject SameSite=None cookies that are not Secure.
export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none",
  sameSite: env.COOKIE_SAME_SITE,
  path: "/",
};
