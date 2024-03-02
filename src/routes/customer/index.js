import express from "express";
import {
  blockCustomerHandler,
  createCustomerHandler,
  listCustomerHandler,
  signupOrLoginOTPVerificationHandler,
  singleCustomerHandler,
  toggleBlockUnblockHandler,
  unblockCustomerHandler,
  updateCustomerHandler,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";

const customerRouter = express.Router();

//create customer
customerRouter.post("/create", createCustomerHandler);

// otp verification
customerRouter.post(
  "/signup-login-otp-verification",
  signupOrLoginOTPVerificationHandler
);

// update server
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

customerRouter.post(
  "/toggle-block-unblock/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  toggleBlockUnblockHandler
);

export default customerRouter;
