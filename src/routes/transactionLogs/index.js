import express from "express";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { singleTransactionLog } from "./post";

const transactionLogRouter = express.Router();

transactionLogRouter.post(
  "/single-transaction-log/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  singleTransactionLog
);

export default transactionLogRouter;
