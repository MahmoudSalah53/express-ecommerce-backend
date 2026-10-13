import { RequestHandler } from "express";
import { cartService } from "../services/cart.service";

export const getCart: RequestHandler = async (req, res) => {
  const items = await cartService.getCart(req.user?.id as number);
  return res.status(200).json({ status: "success", data: items });
};
