import express from "express";
// import { authenticateUser } from "../../middleware/authorization";
import { listTransactions, singleTransaction } from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
// import { onlyAdmin } from "../../middleware/onlyAdmin";

const transactionRouter = express.Router();

transactionRouter.post(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "ACCOUNT"]),
  listTransactions
);
transactionRouter.post(
  "/single-transaction/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "ACCOUNT"]),
  singleTransaction
);

export default transactionRouter;
