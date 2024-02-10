import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import {
  createAdminHandler,
  deleteAdminHandler,
  loginAdminHandler,
  updateAdminHandler,
} from "./post";
import { infoAdminHandler, listAdminHandler } from "./get";

const adminRoute = Router();

adminRoute.post("/create", privateKeyMiddleware, createAdminHandler);
adminRoute.post(`/update/:id`, privateKeyMiddleware, updateAdminHandler);
adminRoute.post(`/delete/:id`, privateKeyMiddleware, deleteAdminHandler);
adminRoute.post(`/login`, privateKeyMiddleware, loginAdminHandler);

adminRoute.get(`/info/:id`, privateKeyMiddleware, infoAdminHandler);
adminRoute.get(`/list`, privateKeyMiddleware, listAdminHandler);

export default adminRoute;
