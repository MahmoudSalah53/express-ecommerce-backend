import { Router } from "express";
import { createCoupon, listCoupons, updateCoupon } from "../controllers/coupon.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import { couponIdParamSchema, createCouponSchema, updateCouponSchema } from "../validators/coupon.validator";
import { validate } from "../middlewares/validate.middleware";

export const adminCouponRouter = Router();

adminCouponRouter.get("/", requireAuth, requireAdmin, asyncHandler(listCoupons));
adminCouponRouter.post("/", requireAuth, requireAdmin, validate({ body: createCouponSchema }), asyncHandler(createCoupon));
adminCouponRouter.patch("/:id", requireAuth, requireAdmin, validate({ params: couponIdParamSchema, body: updateCouponSchema }), asyncHandler(updateCoupon));
