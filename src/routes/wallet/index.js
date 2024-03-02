import express from "express";
import {
  listAdminWalletTransactions,
  listWalletCustomerTransactions,
} from "./get";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";
import { getCustomerSelectHandler } from "./post";
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

// get-customer-select
walletRouter.post(
  "/get-customer-select",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getCustomerSelectHandler
);

export default walletRouter;
