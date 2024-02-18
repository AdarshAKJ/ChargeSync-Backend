import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { createChargerStationValidation } from "../../helpers/validations/charger.station.validation";
import ChargingStationModel from "../../models/chargingStations";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";

export const listChargerStationHandler = async (req, res) => {
  try {
    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    checkClientIdAccess(req.session, where.clientId);

    const pagination = setPagination(req.query);
    const stations = await ChargingStationModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit);

    if (!users) throw new CustomError(`No Station found.`);
    let total_count = await ChargingStationModel.count(where);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { paginatedData: stations, totalCount: total_count },
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
