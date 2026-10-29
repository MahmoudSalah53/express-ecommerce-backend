import { Router } from "express";
import { healthRouter } from "./health.routes";
import { userRouter } from "./user.routes";
import { productRouter } from "./product.routes";
import { categoryRouter } from "./category.routes";
import { cartRouter } from "./cart.routes";
import { addressRouter } from "./address.routes";
import { adminOrderRouter, orderRouter } from "./order.routes";
import { reviewRouter } from "./review.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/address", addressRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/admin/orders", adminOrderRouter);
apiRouter.use("/reviews", reviewRouter);
