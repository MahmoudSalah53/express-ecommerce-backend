import { RequestHandler } from "express";
import { addressService } from "../services/address.service";
import { CreateAddressInput, UpdateAddressInput } from "../validators/address.validator";

export const getAllAddresses: RequestHandler = async (req, res) => {
  const addresses = await addressService.getAll(req.user?.id as number);
  return res.status(200).json({ status: "success", data: addresses });
};

export const createAddress: RequestHandler = async (req, res) => {
  const address = await addressService.create(req.user?.id as number, req.body as CreateAddressInput);
  return res.status(201).json({ status: "success", data: address });
}

export const updateAddress: RequestHandler = async (req, res) => {
  const address = await addressService.update(req.user?.id as number, Number(req.params.id), req.body as UpdateAddressInput);
  return res.status(200).json({ status: "success", data: address });
}

export const deleteAddress: RequestHandler = async (req, res) => {
  const address = await addressService.delete(req.user?.id as number, Number(req.params.id));
  return res.status(200).json({ status: "success", data: address });
}