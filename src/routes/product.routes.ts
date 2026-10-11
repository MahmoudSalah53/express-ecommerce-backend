import { Router } from "express";
import { createProduct, getProductById, listProducts, updateProduct } from "../controllers/product.controller";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createProductSchema, listProductsQuerySchema, productIdParamSchema, updateProductSchema } from "../validators/product.validator";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";

export const productRouter = Router();

productRouter.get("/", validate({ query: listProductsQuerySchema }), asyncHandler(listProducts));
productRouter.get("/:id", validate({ params: productIdParamSchema }), asyncHandler(getProductById));
productRouter.post("/", requireAuth, requireAdmin, validate({ body: createProductSchema }), asyncHandler(createProduct));
productRouter.patch("/:id", requireAuth, requireAdmin, validate({ params: productIdParamSchema, body: updateProductSchema }), asyncHandler(updateProduct));
