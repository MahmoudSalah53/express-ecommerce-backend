import { RequestHandler } from "express";
import { cartService } from "../services/cart.service";

export const getCart: RequestHandler = async (req, res) => {
  const items = await cartService.getCart(req.user?.id as number);
  return res.status(200).json({ status: "success", data: items });
};

export const createCart: RequestHandler = async (req, res) => {
  const { productId, quantity } = req.body;
  const cartItem = await cartService.create(req.user?.id as number, productId, quantity);
  return res.status(201).json({ status: "success", data: cartItem });
}
