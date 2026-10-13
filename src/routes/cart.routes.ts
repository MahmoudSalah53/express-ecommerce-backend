import { Router } from "express";
import { createCart, getCart } from "../controllers/cart.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/auth.middleware";
import { createCartSchema } from "../validators/cart.validator";
import { validate } from "../middlewares/validate.middleware";

export const cartRouter = Router();

cartRouter.get("/", requireAuth, asyncHandler(getCart));
cartRouter.post("/items", requireAuth, validate({ body: createCartSchema }), asyncHandler(createCart));
