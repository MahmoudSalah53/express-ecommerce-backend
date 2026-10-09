import { Router } from "express";
import { createProduct, getProduct, listProducts } from "../controllers/product.controller";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createProductSchema, productIdParamSchema } from "../validators/product.validator";

export const productRouter = Router();

productRouter.get("/", asyncHandler(listProducts));
productRouter.get("/:id", validate({ params: productIdParamSchema }), asyncHandler(getProduct));
productRouter.post("/", validate({ body: createProductSchema }), asyncHandler(createProduct));
