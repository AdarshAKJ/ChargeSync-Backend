import express from "express";
import { listWalletClientlistHandler } from "./get";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";

const clientWalletRouter = express.Router();

// For Client
clientWalletRouter.get(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listWalletClientlistHandler
);

export default clientWalletRouter;
