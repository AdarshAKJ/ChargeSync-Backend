import express from "express";
import {
  customerTransactionsHandler,
  listTransactions,
  singleTransaction,
  singlecustomerTransactionsHandler,
  startTransactionHandler,
  stopTransactionHandler,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";

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

// single customer all transactions
transactionRouter.post(
  "/customer-transactions",
  authenticateCustomer,
  customerTransactionsHandler
);
//  singleTransaction by customerId
transactionRouter.post(
  "/single-customer-transactions/:id",
  authenticateCustomer,
  singlecustomerTransactionsHandler
);

// start transaction
transactionRouter.post("/start", authenticateCustomer, startTransactionHandler);

// stop transaction
transactionRouter.post("/stop", authenticateCustomer, stopTransactionHandler);

export default transactionRouter;
