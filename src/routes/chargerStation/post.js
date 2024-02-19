import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  createChargerStationValidation,
  updateChargerStationValidation,
} from "../../helpers/validations/charger.station.validation";
import ChargingStationModel from "../../models/chargingStations";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";

// DONE
export const createChargerStationHandler = async (req, res) => {
  try {
    await createChargerStationValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);
    let chargerStationData = await ChargingStationModel.create({
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
          { ...chargerStationData.toJSON() },
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

// DONE
export const updateChargerStationHandler = async (req, res) => {
  try {
    await updateChargerStationValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    const chargerStationId = req.params.id;

    checkClientIdAccess(req.session, req.body.clientId);

    const chargerStation = await ChargingStationModel.findOne({
      _id: chargerStationId,
      isDeleted: false,
    });

    if (!chargerStation)
      throw new CustomError(
        `The user you are trying to update is deleted or does not exist.`
      );

    let keys = [];
    for (let key in req.body) {
      keys.push(key);
    }

    for (let i = 0; i < keys.length; ++i) {
      chargerStation[keys[i]] = req.body[keys[i]];
    }

    chargerStation.updated_at = getCurrentUnix();
    chargerStation.updated_by = req.session._id;

    await chargerStation.save();

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...chargerStation.toJSON() },
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
