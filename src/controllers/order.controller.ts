import { RequestHandler } from "express";
import { orderService } from "../services/order.service";
import {
  AdminListOrdersQuery,
  CreateOrderInput,
  ListOrdersQuery,
  UpdateOrderStatusInput,
} from "../validators/order.validator";

export const adminListOrders: RequestHandler = async (req, res) => {
  const query = req.query as unknown as AdminListOrdersQuery;
  const { items, total } = await orderService.adminList(query);

  return res.status(200).json({
    status: "success",
    data: items,
    meta: { page: query.page, limit: query.limit, total },
  });
};

export const updateOrderStatus: RequestHandler = async (req, res) => {
  const order = await orderService.updateStatus(Number(req.params.id), req.body as UpdateOrderStatusInput);
  return res.status(200).json({ status: "success", data: order });
};

export const listOrders: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListOrdersQuery;
  const { items, total } = await orderService.list(req.user?.id as number, query);

  return res.status(200).json({
    status: "success",
    data: items,
    meta: { page: query.page, limit: query.limit, total },
  });
};

export const getOrderById: RequestHandler = async (req, res) => {
  const order = await orderService.getById(req.user?.id as number, Number(req.params.id));
  return res.status(200).json({ status: "success", data: order });
};

export const cancelOrder: RequestHandler = async (req, res) => {
  const order = await orderService.cancel(req.user?.id as number, Number(req.params.id));
  return res.status(200).json({ status: "success", data: order });
};

export const createOrder: RequestHandler = async (req, res) => {
  const order = await orderService.create(req.user?.id as number, req.body as CreateOrderInput);
  return res.status(201).json({ status: "success", data: order });
};
