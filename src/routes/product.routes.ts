import { Router } from "express";
import { getProductById, listProducts } from "../controllers/product.controller";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { listProductsQuerySchema, productIdParamSchema } from "../validators/product.validator";

export const productRouter = Router();

productRouter.get("/", validate({ query: listProductsQuerySchema }), asyncHandler(listProducts));
productRouter.get("/:id", validate({ params: productIdParamSchema }), asyncHandler(getProductById));