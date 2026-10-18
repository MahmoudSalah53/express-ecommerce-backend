import { Router } from "express";
import { createAddress, deleteAddress, getAllAddresses, updateAddress } from "../controllers/address.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/auth.middleware";
import { addressIdParamSchema, createAddressSchema, updateAddressSchema } from "../validators/address.validator";
import { validate } from "../middlewares/validate.middleware";


export const addressRouter = Router();


addressRouter.get("/", requireAuth, asyncHandler(getAllAddresses));
addressRouter.post("/", requireAuth, validate({ body: createAddressSchema }), asyncHandler(createAddress));
addressRouter.patch("/:id", requireAuth, validate({ params: addressIdParamSchema, body: updateAddressSchema }), asyncHandler(updateAddress));
addressRouter.delete("/:id", requireAuth, validate({ params: addressIdParamSchema }), asyncHandler(deleteAddress));