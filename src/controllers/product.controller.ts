import { RequestHandler } from "express";
import { productService } from "../services/product.service";
import { CreateProductInput } from "../validators/product.validator";

export const listProducts: RequestHandler = async (_req, res) => {
  const items = await productService.list();
  res.json({ status: "success", data: items });
};

export const getProduct: RequestHandler = async (req, res) => {
  const item = await productService.getById(Number(req.params.id));
  res.json({ status: "success", data: item });
};

export const createProduct: RequestHandler = async (req, res) => {
  const item = await productService.create(req.body as CreateProductInput);
  res.status(201).json({ status: "success", data: item });
};
