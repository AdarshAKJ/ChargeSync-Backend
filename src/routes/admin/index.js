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
adminRoute.post(`/login`, privateKeyMiddleware, loginAdminHandler); //DONE
adminRoute.post("/create", privateKeyMiddleware, createAdminHandler); // DONE

adminRoute.post(`/update/:id`, privateKeyMiddleware, updateAdminHandler);
adminRoute.post(`/delete/:id`, privateKeyMiddleware, deleteAdminHandler);
adminRoute.get(`/info/:id`, privateKeyMiddleware, infoAdminHandler);
adminRoute.get(`/list`, privateKeyMiddleware, listAdminHandler);

export default adminRoute;
