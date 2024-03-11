import express from "express";
import {
  createCustomerHandler,
  getCustomerSelectHandler,
  listCustomerHandler,
  loginHandler,
  signupOrLoginOTPVerificationHandler,
  singleCustomerHandler,
  toggleBlockUnblockHandler,
  updateCustomerHandler,
  v2CreateCustomerHandler,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";
import { privateKeyMiddleware } from "../../middleware/privateKeyCheck";

const customerRouter = express.Router();

//create customer
customerRouter.post("/create", privateKeyMiddleware, createCustomerHandler);

//create customer
customerRouter.post(
  "/v2/create",
  privateKeyMiddleware,
  v2CreateCustomerHandler
);

// otp verification
customerRouter.post(
  "/signup-login-otp-verification",
  privateKeyMiddleware,
  signupOrLoginOTPVerificationHandler
);

// login
customerRouter.post("/login", privateKeyMiddleware, loginHandler);

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

// get-customer-select
customerRouter.post(
  "/get-customer-select",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getCustomerSelectHandler
);

// block-unblock
customerRouter.post(
  "/toggle-block-unblock/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  toggleBlockUnblockHandler
);

export default customerRouter;
