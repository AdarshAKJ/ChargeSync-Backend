import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import VehicleModel from "../../models/vehicle";
import { ValidationError } from "joi";



// delete vehicle
export const deleteVehicleHandler = async (req, res) => {
    try {
      // Validate request parameter
  
      // Find the vehicle by ID and client/customer IDs
      const vehicle = await VehicleModel.findOne({
        _id: req.params.id,
        clientId: req.session.clientId,
        customerId: req.session._id,
        isDeleted: false,
      });
  
      // If vehicle not found, throw an error
      if (!vehicle) {
        throw new CustomError(`Vehicle not found.`);
      }
  
      // Soft delete the vehicle by marking it as deleted
      vehicle.isDeleted = true;
      await vehicle.save();
  
      // Return success response
      return res.status(StatusCodes.OK).send(
        responseGenerators(
          {
            message: `Vehicle deleted successfully.`,
          },
          StatusCodes.OK,
          "SUCCESS",
          0
        )
      );
    } catch (error) {
      // Handle validation and custom errors
      if (error instanceof ValidationError || error instanceof CustomError) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(
            responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
          );
      }
      // Log and return internal server error for other errors
      console.log(JSON.stringify(error));
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(
          responseGenerators(
            {},
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Internal Server Error",
            1
          )
        );
    }
  };
  



