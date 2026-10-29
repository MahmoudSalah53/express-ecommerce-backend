import { RequestHandler } from "express";
import { getAuthUser } from "../middlewares/auth.middleware";
import { reviewService } from "../services/review.service";
import { CreateReviewInput, ListReviewsQuery, UpdateReviewInput } from "../validators/review.validator";

export const updateReview: RequestHandler = async (req, res) => {
  const review = await reviewService.update(req.user?.id as number, Number(req.params.id), req.body as UpdateReviewInput);
  return res.status(200).json({ status: "success", data: review });
};

export const deleteReview: RequestHandler = async (req, res) => {
  const review = await reviewService.delete(req.user?.id as number, Number(req.params.id));
  return res.status(200).json({ status: "success", data: review });
};

export const createProductReview: RequestHandler = async (req, res) => {
  const review = await reviewService.create(
    req.user?.id as number,
    Number(req.params.id),
    req.body as CreateReviewInput,
  );
  return res.status(201).json({ status: "success", data: review });
};

export const listProductReviews: RequestHandler = async (req, res) => {
  const user = await getAuthUser(req);
  const isAdmin = user?.role === "ADMIN";

  const query = req.query as unknown as ListReviewsQuery;
  const { items, average, count } = await reviewService.listForProduct(Number(req.params.id), query, isAdmin);

  return res.status(200).json({
    status: "success",
    data: { items, average, count },
    meta: { page: query.page, limit: query.limit, total: count },
  });
};
