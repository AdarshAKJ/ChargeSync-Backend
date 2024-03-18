import express from "express";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { createSupportTicket, markTicketAsResolvedHandler, updateSupportTicket } from "./post";
import { deleteSupportTicket, listClientSupportTickets, listSupportTickets, markTicketAsClosedHandler } from "./get";
import { onlyAdmin } from "../../middleware/onlyAdmin";

const supportRouter = express.Router();

// Create Ticket
supportRouter.post(
  "/create-ticket",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createSupportTicket
);

// List-Ticket (Admin)
supportRouter.get(
  "/list-ticket-admin",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listSupportTickets
);

// List-Ticket (Client)
supportRouter.get(
  "/list-ticket-client/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listClientSupportTickets
);

// Update Ticket
supportRouter.post(
  "/update-ticket/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  updateSupportTicket
);

// Delete-Ticket
supportRouter.get(
  "/delete-ticket/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  deleteSupportTicket
);

// Mark Ticket as "RESOLVED"
supportRouter.post(
  "/mark-resolved/:id",
  onlyAdmin,
  markTicketAsResolvedHandler
);

// Mark Ticket as "CLOSED"
supportRouter.get(
  "/mark-closed/:id",
  onlyAdmin,
  markTicketAsClosedHandler
);


export default supportRouter;
