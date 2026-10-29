import { Router } from "express";
import {
  adminListOrders,
  cancelOrder,
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import {
  adminListOrdersQuerySchema,
  createOrderSchema,
  listOrdersQuerySchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator";
import { validate } from "../middlewares/validate.middleware";

export const orderRouter = Router();
export const adminOrderRouter = Router();

adminOrderRouter.get("/", requireAuth, requireAdmin, validate({ query: adminListOrdersQuerySchema }), asyncHandler(adminListOrders));
adminOrderRouter.patch("/:id", requireAuth, requireAdmin, validate({ params: orderIdParamSchema, body: updateOrderStatusSchema }), asyncHandler(updateOrderStatus));

orderRouter.post("/", requireAuth, validate({ body: createOrderSchema }), asyncHandler(createOrder));
orderRouter.get("/", requireAuth, validate({ query: listOrdersQuerySchema }), asyncHandler(listOrders));
orderRouter.get("/:id", requireAuth, validate({ params: orderIdParamSchema }), asyncHandler(getOrderById));
orderRouter.post("/:id/cancel", requireAuth, validate({ params: orderIdParamSchema }), asyncHandler(cancelOrder));
