import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { maintenanceValidation } from "../../helpers/validations/maintenance.validation";
import { getCurrentUnix } from "../../commons/common-functions";
import MaintenanceModel from "../../models/maintenance";

export const createMaintenanceHandler = async (req, res) => {
  try {
    await maintenanceValidation.validateAsync(req.body);
    // const MaintenanceData;
    const MaintenanceData = await MaintenanceModel.create({
      ...req.body,
      created_by: req.session._id,
      updated_by: req.session._id,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });
    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...MaintenanceData.toJSON() },
          StatusCodes.OK,
          "SUCCESS",
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
