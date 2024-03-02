import express from "express";
import { dashboardHandler } from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
const dashboardRouter = express.Router();

// For customers
dashboardRouter.post(
  "/",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  dashboardHandler
);

export default dashboardRouter;
