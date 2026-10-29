import { RequestHandler } from "express";
import { couponService } from "../services/coupon.service";
import { CreateCouponInput, UpdateCouponInput } from "../validators/coupon.validator";

export const listCoupons: RequestHandler = async (_req, res) => {
  const coupons = await couponService.list();
  return res.status(200).json({ status: "success", data: coupons });
};

export const createCoupon: RequestHandler = async (req, res) => {
  const coupon = await couponService.create(req.body as CreateCouponInput);
  return res.status(201).json({ status: "success", data: coupon });
};

export const updateCoupon: RequestHandler = async (req, res) => {
  const coupon = await couponService.update(Number(req.params.id), req.body as UpdateCouponInput);
  return res.status(200).json({ status: "success", data: coupon });
};
