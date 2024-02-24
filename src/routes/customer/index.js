import express from "express";
import { createCustomerHandler } from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";

const customerRouter = express.Router();

customerRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createCustomerHandler
);

export default customerRouter;
