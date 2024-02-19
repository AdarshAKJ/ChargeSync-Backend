import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import ChargerModel from "../../models/charger";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { setPagination } from "../../commons/common-functions";

export const deleteChargerHandler = async (req, res) => {
  try {
    const { id: ChargerId } = req.params;
    let clientId = req.session.clientId || req.query.clientId;
    checkClientIdAccess(req.session, clientId);

    const Charger = await ChargerModel.findOne({
      _id: ChargerId,
      clientId: clientId,
      isDeleted: false,
    });

    if (!Charger) throw new CustomError(`No existing charger found.`);

    Charger.isDeleted = true;

    await Charger.save();

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators({}, StatusCodes.OK, "SUCCESS", 0));
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

export const listChargerHandler = async (req, res) => {
  try {
    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    checkClientIdAccess(req.session, where.clientId);

    if (req.query?.status) {
      where = {
        ...where,
        status: new RegExp(req.query?.status.toString(), "i"),
      };
    }

    if (req.query?.search) {
      where = {
        ...where,
        name: new RegExp(req.query?.search.toString(), "i"),
      };
    }

    const pagination = setPagination(req.query);
    const chargers = await ChargerModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    if (!chargers) throw new CustomError(`No users found.`);
    let total_count = chargers.length;

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: chargers,
          totalCount: total_count,
          itemsPerPage: pagination.limit,
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

export const singleChargerHandler = async (req, res) => {
  try {
    const { id: ChargerId } = req.params;
    let clientId = req.session.clientId || req.query.clientId;
    checkClientIdAccess(req.session, clientId);

    const Charger = await ChargerModel.findOne({
      _id: ChargerId,
      clientId: clientId,
      isDeleted: false,
    })
      .lean()
      .exec();

    if (!Charger) throw new CustomError(`No such charger found.`);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ChargerStationDetails: Charger },
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

// filter according to status
export const getChargerCountHandler = async (req, res) => {
  try {
    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    checkClientIdAccess(req.session, where.clientId);

    let total_count = await ChargerModel.count(where);

    if (!total_count) throw new CustomError(`No chargers found.`);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { totalChargerCount: total_count },
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
