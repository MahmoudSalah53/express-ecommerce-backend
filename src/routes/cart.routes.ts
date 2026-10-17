import { Router } from "express";
import { createCart, deleteCartItem, getCart, updateCartItem } from "../controllers/cart.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/auth.middleware";
import { cartIdParamSchema, createCartSchema, updateCartItemSchema } from "../validators/cart.validator";
import { validate } from "../middlewares/validate.middleware";

export const cartRouter = Router();

cartRouter.get("/", requireAuth, asyncHandler(getCart));
cartRouter.post("/items", requireAuth, validate({ body: createCartSchema }), asyncHandler(createCart));
cartRouter.patch("/items/:id", requireAuth, validate({ params: cartIdParamSchema, body: updateCartItemSchema }), asyncHandler(updateCartItem));
cartRouter.delete("/items/:id", requireAuth, validate({ params: cartIdParamSchema }), asyncHandler(deleteCartItem));