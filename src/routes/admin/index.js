import { Router } from "express";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";
import { createAdminHandler } from "./post";

const adminRoute = Router();

adminRoute.post("/create", privateKeyMiddleware, createAdminHandler);

export default adminRoute;
