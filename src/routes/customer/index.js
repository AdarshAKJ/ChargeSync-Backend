import express from "express";
import {
  createCustomerHandler,
  listCustomerHandler,
  signupOrLoginOTPVerificationHandler,
  singleCustomerHandler,
  startTransactionHandler,
  stopTransactionHandler,
  updateCustomerHandler,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";

const customerRouter = express.Router();

customerRouter.post("/create", createCustomerHandler);
customerRouter.post(
  "/signup-login-otp-verification",
  signupOrLoginOTPVerificationHandler
);
customerRouter.post("/update/:id", authenticateCustomer, updateCustomerHandler);
customerRouter.post(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listCustomerHandler
);
customerRouter.post(
  "/single-customer/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  singleCustomerHandler
);

// start transaction
customerRouter.post(
  "/start-transaction",
  authenticateCustomer,
  startTransactionHandler
);

// stop transaction
customerRouter.post(
  "/stop-transaction",
  authenticateCustomer,
  stopTransactionHandler
);

export default customerRouter;
