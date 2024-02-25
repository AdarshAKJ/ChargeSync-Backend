import express from "express";
import { createCustomerHandler, updateCustomerHandler } from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";

const customerRouter = express.Router();

customerRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createCustomerHandler
);
customerRouter.post(
  "/update:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  updateCustomerHandler
);

export default customerRouter;
