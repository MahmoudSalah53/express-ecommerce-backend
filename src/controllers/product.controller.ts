import { RequestHandler } from "express";
import { productService } from "../services/product.service";
import { CreateProductInput, ListProductsQuery } from "../validators/product.validator";
import { getAuthUser } from "../middlewares/auth.middleware";

export const listProducts: RequestHandler = async (req, res) => {
  const user = await getAuthUser(req);
  const isAdmin = user?.role === "ADMIN";

  const query = req.query as unknown as ListProductsQuery;
  const { items, total } = await productService.list(query, isAdmin);

  res.json({
    status: "success",
    data: items,
    meta: { page: query.page, limit: query.limit, total },
  });
};

export const getProductById: RequestHandler = async (req, res) => {
  const user = await getAuthUser(req);
  const isAdmin = user?.role === "ADMIN";

  const product = await productService.getById(Number(req.params.id), isAdmin);

  res.status(200).json({
    status: "success",
    data: product,
  });
}


export const createProduct: RequestHandler = async (req, res) => {

  const product = await productService.create(req.body as CreateProductInput);

  res.status(201).json({
    status: "success",
    data: product,
  });
}

