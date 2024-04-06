import express from "express";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { createWithdrawRequestHandler, deleteWithdrawRequestHandler, updateWithdrawRequestByAdminHandler, updateWithdrawRequestByClientHandler } from "./post";
import { onlyAdmin } from "../../middleware/onlyAdmin";
import { listWalletRequestsForAdminHandler, listWalletRequestsForClientHandler } from "./get";


const withdrawRequestRouter = express.Router();


// Create Withdraw Request
withdrawRequestRouter.post("/create", onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]), createWithdrawRequestHandler);

// Update Withdraw Request By Client
withdrawRequestRouter.post("/update-client/:id", onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]), updateWithdrawRequestByClientHandler);

// Update Withdraw Request By Admin
withdrawRequestRouter.post("/update-admin/:id", onlyAdmin, updateWithdrawRequestByAdminHandler);

// List Withdraw Request Client
withdrawRequestRouter.get("/list-client", onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]), listWalletRequestsForClientHandler);

// List Withdraw Request Admin
withdrawRequestRouter.get("/list-admin", onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]), listWalletRequestsForAdminHandler);

// Delete Withdraw Request
withdrawRequestRouter.get("/delete/id", onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]), deleteWithdrawRequestHandler);

export default withdrawRequestRouter;
