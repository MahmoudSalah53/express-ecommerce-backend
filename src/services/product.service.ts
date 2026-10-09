import { AppError } from "../utils/AppError";
import { CreateProductInput } from "../validators/product.validator";

export const productService = {
  list(): Promise<unknown[]> {
    throw new AppError("Not implemented", 501);
  },

  getById(_id: number): Promise<unknown> {
    throw new AppError("Not implemented", 501);
  },

  create(_input: CreateProductInput): Promise<unknown> {
    throw new AppError("Not implemented", 501);
  },
};
