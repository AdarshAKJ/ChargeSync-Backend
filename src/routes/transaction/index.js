import express from "express";
import {
  listTransactions,
  singleTransaction,
  startTransactionHandler,
  stopTransactionHandler,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";
// import { authenticateCustomer } from "../../middleware/authenticateCustomer";

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
transactionRouter.post(
  "/customer-transactions/:id",
  authenticateCustomer
  // customerTransactionsHandler
);

// start transaction
transactionRouter.post("/start", authenticateCustomer, startTransactionHandler);

// stop transaction
transactionRouter.post("/stop", authenticateCustomer, stopTransactionHandler);

export default transactionRouter;
