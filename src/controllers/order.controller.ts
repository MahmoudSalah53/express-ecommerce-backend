import { RequestHandler } from "express";
import { orderService } from "../services/order.service";
import { CreateOrderInput } from "../validators/order.validator";

export const createOrder: RequestHandler = async (req, res) => {
  const order = await orderService.create(req.user?.id as number, req.body as CreateOrderInput);
  return res.status(201).json({ status: "success", data: order });
};
