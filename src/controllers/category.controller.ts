import { RequestHandler } from "express";
import { categoryService } from "../services/category.service";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";

export const createCategory: RequestHandler = async (req, res) => {
  const result = await categoryService.create(req.body as CreateCategoryInput);
  res.status(201).json({ status: "success", data: result });
};

export const getAllCategories: RequestHandler = async (req, res) => {
  const result = await categoryService.getAll();
  res.status(200).json({ status: "success", data: result });
};

export const getCategoryById: RequestHandler = async (req, res) => {
  const result = await categoryService.getById(Number(req.params.id));
  res.status(200).json({ status: "success", data: result });
};

export const updateCategory: RequestHandler = async (req, res) => {
  const result = await categoryService.update(Number(req.params.id), req.body as UpdateCategoryInput);
  res.status(200).json({ status: "success", data: result });
};

export const deleteCategory: RequestHandler = async (req, res) => {
  const result = await categoryService.delete(Number(req.params.id));
  res.status(200).json({ status: "success", data: result });
};