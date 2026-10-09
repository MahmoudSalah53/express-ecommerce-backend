import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/category.controller";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createCategorySchema, categoryIdParamSchema, updateCategorySchema } from "../validators/category.validator";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";

export const categoryRouter = Router();

categoryRouter.post("/", requireAuth, requireAdmin, validate({ body: createCategorySchema }), asyncHandler(createCategory));
categoryRouter.get("/", asyncHandler(getAllCategories));
categoryRouter.get("/:id", validate({ params: categoryIdParamSchema }), asyncHandler(getCategoryById));
categoryRouter.patch("/:id", requireAuth, requireAdmin, validate({ params: categoryIdParamSchema, body: updateCategorySchema }), asyncHandler(updateCategory));
categoryRouter.delete("/:id", requireAuth, requireAdmin, validate({ params: categoryIdParamSchema }), asyncHandler(deleteCategory));

