import { ValidationError } from "joi";
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

export const updateMaintenanceHandler = async (req, res) => {
  try {
    await maintenanceValidation.validateAsync(req.body);

    const maintenanceId = req.params.id;

    const existingMaintenance = await MaintenanceModel.findOne({
      _id: maintenanceId,
    });

    if (!existingMaintenance) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(
          responseGenerators(
            {},
            StatusCodes.NOT_FOUND,
            "Maintenance record not found",
            1
          )
        );
    }
    let keys = [];

    for (let key in req.body) {
      keys.push(key);
    }

    for (let key of keys) {
      existingMaintenance[key] = req.body[key];
    }

    await existingMaintenance.save();

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          null,
          StatusCodes.OK,
          "Maintenance record updated successfully",
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
