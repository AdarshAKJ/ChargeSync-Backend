import express from "express";
import {
  listAdminWalletTransactions,
  listWalletCustomerTransactions,
} from "./get";
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
  "/list-admin",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listAdminWalletTransactions
);

export default walletRouter;
