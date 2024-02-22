import express from "express";
// import { authenticateUser } from "../../middleware/authorization";
import { listTransactions } from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
// import { onlyAdmin } from "../../middleware/onlyAdmin";

const transactionRouter = express.Router();

transactionRouter.post(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  listTransactions
);

export default transactionRouter;
