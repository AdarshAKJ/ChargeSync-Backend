import express from "express";
import { listWalletCustomerTransactions, listWalletTransactions } from "./get";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";
const walletRouter = express.Router();

// For customers
walletRouter.post(
  "/list",
  authenticateCustomer,
  listWalletCustomerTransactions
);

// For Admin or Operators
walletRouter.post(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listWalletTransactions
);

export default walletRouter;
