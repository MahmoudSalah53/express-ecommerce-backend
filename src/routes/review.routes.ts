import { Router } from "express";
import { deleteReview, updateReview } from "../controllers/review.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/auth.middleware";
import { reviewIdParamSchema, updateReviewSchema } from "../validators/review.validator";
import { validate } from "../middlewares/validate.middleware";

export const reviewRouter = Router();

reviewRouter.patch("/:id", requireAuth, validate({ params: reviewIdParamSchema, body: updateReviewSchema }), asyncHandler(updateReview));
reviewRouter.delete("/:id", requireAuth, validate({ params: reviewIdParamSchema }), asyncHandler(deleteReview));
