import { Router } from "express";
import { getCart } from "../controllers/cart.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/auth.middleware";

export const cartRouter = Router();

cartRouter.get("/", requireAuth, asyncHandler(getCart));
