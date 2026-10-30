import { RequestHandler } from "express";
import { userService } from "../services/user.service";
import { CreateUserInput, LoginUserInput } from "../validators/user.validator";
import { COOKIE_NAME, cookieOptions } from "../config/cookie";
import { getAuthUser } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";

export const createUser: RequestHandler = async (req, res) => {
  const item = await userService.create(req.body as CreateUserInput);
  res.status(201).json({ status: "success", data: item });
};


export const loginUser: RequestHandler = async (req, res) => {
  const currentUser = await getAuthUser(req);
  if (currentUser) throw new AppError("Already logged in", 400);

  const { token, user } = await userService.login(req.body as LoginUserInput);

  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ status: "success", data: user });
}

export const logoutUser: RequestHandler = async (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);

  res.status(200).json({ status: "success", message: "Logged out successfully" });
}

export const getMe: RequestHandler = async (req, res) => {
  res.status(200).json({ status: "success", data: req.user });
}
