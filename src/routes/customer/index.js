import express from "express";
import {
  createCustomerHandler,
  getChargerSelectHandler,
  getCustomerSelectHandler,
  getStationSelectHandler,
  listCustomerHandler,
  signupOrLoginOTPVerificationHandler,
  singleCustomerHandler,
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

//single customer details
customerRouter.post(
  "/single-customer/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  singleCustomerHandler
);

//
// get-customer-select
customerRouter.post(
  "/get-customer-select",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getCustomerSelectHandler
);

// get-charger-select
customerRouter.post(
  "/get-charger-select",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getChargerSelectHandler
);

// get-station-select
customerRouter.post(
  "/get-station-selectid",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getStationSelectHandler
);

export default customerRouter;
