import { StatusCodes } from "http-status-codes";
import { ValidationError } from "joi";
import { deleteTicketValidation } from "../../helpers/validations/supportTicket.Validation";
import { CustomError } from "../../helpers/custome.error";
import SupportTicketsModel from "../../models/supportTicket";
import { responseGenerators } from "../../lib/utils";


// Delete the support ticket with the given ID
export const deleteSupportTicket = async (req, res) => {
    try {
      await deleteTicketValidation.validateAsync(req.params); 
      const supportTicket = await SupportTicketsModel.findByIdAndDelete(req.params.id);
  
      if (!supportTicket) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Support ticket not found" });
      }
      return res.status(StatusCodes.OK).send(
        responseGenerators(
            StatusCodes.OK,
            "Support ticket deleted",
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


 // Retrieve all support tickets (ADMIN)
export const listSupportTickets = async (req, res) => {
    try {
      const supportTickets = await SupportTicketsModel.find();
  
      return res.status(StatusCodes.OK).send(
        responseGenerators(
            supportTickets,
            StatusCodes.OK,
            "SUCCESS",
            0
        )
    );
    }catch (error) {
        if (error instanceof ValidationError || error instanceof CustomError) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        }
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  };

  export const listClientSupportTickets = async (req, res) => {
    try {
        const clientId = req.params.id;
        const supportTickets = await SupportTicketsModel.find({clientId});

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                supportTickets,
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
  
  