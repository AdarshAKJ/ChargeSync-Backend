import { StatusCodes } from "http-status-codes";
import { setPagination } from "../../commons/common-functions";

import CustomerModel from "../../models/customer";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import {
  getChargerSelectValidation,
  getCustomerSelectValidation,
  getStationSelectValidation,
} from "../../helpers/validations/wallet.validation";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import ChargerModel from "../../models/charger";
import ChargingStationModel from "../../models/chargingStations";

// get-customer-select
export const getCustomerSelectHandler = async (req, res) => {
  try {
    await getCustomerSelectValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      clientId: req?.session?.clientId || req?.body?.clientId,
    };

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { fname: new RegExp(req.query.search.toString(), "i") },
            { lname: new RegExp(req.query.search.toString(), "i") },
            { phoneNumber: new RegExp(req.query.search.toString(), "i") },
            { email: new RegExp(req.query.search.toString(), "i") },
          ],
        },
      };
    }

    const pagination = setPagination(req.query);

    const customer = await CustomerModel.find(where)
      .select("_id fname lname")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          selectedCustomer: customer,
        },
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

// get-charger-select
export const getChargerSelectHandler = async (req, res) => {
  try {
    await getChargerSelectValidation.validateAsync(req.body);

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req?.session?.clientId || req?.body?.clientId,
    };

    if (req.query?.search) {
      where = {
        ...where,
        name: new RegExp(req.query?.search.toString(), "i"),
      };
    }

    const pagination = setPagination(req.query);

    const charger = await ChargerModel.find(where)
      .select("serialNumber name")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          selectedCharger: charger,
        },
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

// get-station-select
export const getStationSelectHandler = async (req, res) => {
  try {
    await getStationSelectValidation.validateAsync(req.body);

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    if (req.query?.search) {
      where = {
        ...where,
        station_name: new RegExp(req.query?.search.toString(), "i"),
      };
    }

    const pagination = setPagination(req.query);

    const station = await ChargingStationModel.find(where)
      .select("_id station_name")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    if (!station) throw new CustomError("Station not found");

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          selectedStation: station,
        },
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
