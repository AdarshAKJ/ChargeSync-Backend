import express from "express";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { createSupportTicket, markTicketAsResolvedHandler, updateSupportTicket } from "./post";
import { deleteSupportTicket, listClientSupportTickets, listSupportTickets, markTicketAsClosedHandler } from "./get";
import { onlyAdmin } from "../../middleware/onlyAdmin";

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


supportRouter.get(
  "/delete-ticket/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  deleteSupportTicket
);

supportRouter.post(
  "/mark-resolved/:id",
  onlyAdmin,
  markTicketAsResolvedHandler
);


supportRouter.get(
  "/mark-closed/:id",
  onlyAdmin,
  markTicketAsClosedHandler
);


export default supportRouter;
