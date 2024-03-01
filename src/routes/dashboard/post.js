import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import dashboardValidation from "../../helpers/validations/dashboardValidation";

export const dashboard = async (req, res) => {
  try {
    await dashboardValidation.validateAsync(req.body);

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators({}, StatusCodes.OK, "Success", 0));
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
