import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import {
  createAdminHandler,
  deleteAdminHandler,
  updateAdminHandler,
} from "./post";
import { infoAdminHandler, listAdminHandler } from "./get";

const adminRoute = Router();

adminRoute.post("/create", privateKeyMiddleware, createAdminHandler);
adminRoute.post(`/update/:id`, privateKeyMiddleware, updateAdminHandler);
adminRoute.post(`/info/:id`, privateKeyMiddleware, infoAdminHandler);
adminRoute.post(`/delete/:id`, privateKeyMiddleware, deleteAdminHandler); //check
adminRoute.get(`/list`, privateKeyMiddleware, listAdminHandler);

export default adminRoute;
