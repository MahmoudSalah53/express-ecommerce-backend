import { Router } from "express";
import { createUser, getMe, loginUser, logoutUser } from "../controllers/user.controller";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { createUserSchema, loginUserSchema } from "../validators/user.validator";
import { requireAuth } from "../middlewares/auth.middleware";

export const userRouter = Router();

userRouter.get("/me", requireAuth, asyncHandler(getMe));
userRouter.post("/login", validate({ body: loginUserSchema }), asyncHandler(loginUser));
userRouter.post("/signup", validate({ body: createUserSchema }), asyncHandler(createUser));
userRouter.post("/logout", asyncHandler(logoutUser));
