import { Router } from "express";
import { createOrder, getOrderById, listOrders } from "../controllers/order.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/auth.middleware";
import { createOrderSchema, listOrdersQuerySchema, orderIdParamSchema } from "../validators/order.validator";
import { validate } from "../middlewares/validate.middleware";

export const orderRouter = Router();

orderRouter.post("/", requireAuth, validate({ body: createOrderSchema }), asyncHandler(createOrder));
orderRouter.get("/", requireAuth, validate({ query: listOrdersQuerySchema }), asyncHandler(listOrders));
orderRouter.get("/:id", requireAuth, validate({ params: orderIdParamSchema }), asyncHandler(getOrderById));
