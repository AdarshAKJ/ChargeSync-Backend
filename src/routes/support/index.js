import express from "express";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { createSupportTicket, updateSupportTicket } from "./post";
import { deleteSupportTicket, listClientSupportTickets, listSupportTickets } from "./get";

const supportRouter = express.Router();

supportRouter.post(
  "/create-ticket",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createSupportTicket
);

supportRouter.get(
  "/list-ticket-admin",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listSupportTickets
);

supportRouter.get(
  "/list-ticket-client/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listClientSupportTickets
);

supportRouter.post(
  "/update-ticket/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  updateSupportTicket
);

//Add Dummy Messages to DataBase
supportRouter.get(
  "/delete-ticket/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  deleteSupportTicket
);

export default supportRouter;
