import { StatusCodes } from "http-status-codes";
import { ValidationError } from "joi";
import { ResolveTicketValidation, createSupportTicketValidation, updateSupportTicketValidation } from "../../helpers/validations/supportTicket.Validation";
import { CustomError } from "../../helpers/custome.error";
import { generatePublicId, getCurrentUnix } from "../../commons/common-functions";
import SupportTicketsModel from "../../models/supportTicket";
import { responseGenerators } from "../../lib/utils";

export const createSupportTicket = async (req, res) => {
    try {
        await createSupportTicketValidation.validateAsync(req.body);
        // Create a new support ticket
        const supportTicket = await SupportTicketsModel.create({
            ...req.body,
            _id: generatePublicId(),
            created_at: getCurrentUnix(), 
            updated_at: getCurrentUnix(),
        });

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                supportTicket,
                StatusCodes.OK,
                "SUCCESS",
                0
            )
        );
    } catch (error) {
        if (error instanceof ValidationError || error instanceof CustomError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
};



export const updateSupportTicket = async (req, res) => {
    try {
        await updateSupportTicketValidation.validateAsync(req.body);
        // Update the support ticket with the given ID
        const supportTicket = await SupportTicketsModel
            .findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true });

        if (!supportTicket) {
            throw new CustomError("Support ticket not found");
        }
        return res.status(StatusCodes.OK).send(
            responseGenerators(
                supportTicket,
                StatusCodes.OK,
                "SUCCESS",
                0
            )
        );
    } catch (error) {
        if (error instanceof ValidationError || error instanceof CustomError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
};


export const markTicketAsResolvedHandler = async (req, res) => {
    try {
      await ResolveTicketValidation.validateAsync(req.body);
  
      // Extract ticket ID from request parameters
      const id  = req.params.id;
  
      // Find the support ticket by ID and update its status to "RESOLVED"
      const supportTicket = await SupportTicketsModel.findByIdAndUpdate(
        id,
        {
          status: "RESOLVED",
          resolved_summary: req.body.resolved_summary,
          resolved_at: getCurrentUnix(),
          resolved_by: req.session._id, 
          updated_at: getCurrentUnix(),
        },
        { new: true }
      );
  
      // Check if ticket exists
      if (!supportTicket) {
        throw new CustomError("Support ticket not found", StatusCodes.NOT_FOUND);
      }

      return res.status(StatusCodes.OK).send(
        responseGenerators(supportTicket, StatusCodes.OK, "SUCCESS", 0)
      );
    } catch (error) {
      // Handle validation errors and custom errors
      if (error instanceof ValidationError || error instanceof CustomError) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      }
      console.error("Error resolving support ticket:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  };
  
