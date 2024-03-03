import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import ClientUserModel from "../../models/clientUser";
import { responseGenerators } from "../../lib/utils";
//import { singleClientUserValidation } from "../../helpers/validations/client.user.validation";
import { ValidationError } from "joi";
import { singleClientUserValidation } from "../../helpers/validations/client.user.validation";

export const getSingleClientUser = async (req, res) => {
    try {
    await singleClientUserValidation.validateAsync(req.body);
      checkClientIdAccess(req.session, req.body.clientId);
  
      const { id } = req.params;
  
      const user = await ClientUserModel.findOne({
        _id: id,
        isDeleted: false,
      });
  
      if (!user) {
        throw new CustomError(`User not found.`);
      }
  
      return res.status(StatusCodes.OK).send(
        responseGenerators(
          { user },
          StatusCodes.OK,
          "User found successfully",
          0
        )
      );
    } catch (error) {
        if (error instanceof ValidationError || error instanceof CustomError) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .send(
              responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
            );
        }
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