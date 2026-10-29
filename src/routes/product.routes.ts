import { Router } from "express";
import { createProduct, deletedProduct, getProductById, listProducts, updateProduct } from "../controllers/product.controller";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createProductSchema, listProductsQuerySchema, productIdParamSchema, updateProductSchema } from "../validators/product.validator";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import { createProductReview, listProductReviews } from "../controllers/review.controller";
import { createReviewSchema, listReviewsQuerySchema } from "../validators/review.validator";

export const productRouter = Router();

productRouter.get("/", validate({ query: listProductsQuerySchema }), asyncHandler(listProducts));
productRouter.get("/:id", validate({ params: productIdParamSchema }), asyncHandler(getProductById));
productRouter.get("/:id/reviews", validate({ params: productIdParamSchema, query: listReviewsQuerySchema }), asyncHandler(listProductReviews));
productRouter.post("/:id/reviews", requireAuth, validate({ params: productIdParamSchema, body: createReviewSchema }), asyncHandler(createProductReview));
productRouter.post("/", requireAuth, requireAdmin, validate({ body: createProductSchema }), asyncHandler(createProduct));
productRouter.patch("/:id", requireAuth, requireAdmin, validate({ params: productIdParamSchema, body: updateProductSchema }), asyncHandler(updateProduct));
productRouter.delete("/:id", requireAuth, requireAdmin, validate({ params: productIdParamSchema }), asyncHandler(deletedProduct));