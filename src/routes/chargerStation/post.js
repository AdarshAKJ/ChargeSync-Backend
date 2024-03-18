import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  createChargerStationValidation,
  deleteChargerStationValidation,
  getChargerStationValidation,
  listChargerStationValidation,
  singleChargerStationValidation,
  updateChargerStationValidation,
} from "../../helpers/validations/charger.station.validation";
import ChargingStationModel from "../../models/chargingStations";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import ClientModel from "../../models/client";
import { getStationSelectValidation } from "../../helpers/validations/customer.validation";

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

    if (
      !chargerStationData.own_by ||
      !chargerStationData.contact_no ||
      !chargerStationData.contact_email
    ) {
      let clientData = await ClientModel.findOne({
        clientId: req.body.ClientModel,
        isDeleted: false,
      });

      if (!chargerStationData.own_by) {
        chargerStationData.own_by = clientData.contactPerson;
      }

      if (!chargerStationData.contact_no) {
        chargerStationData.contact_no = clientData.contactPersonPhoneNumber;
      }

      if (!chargerStationData.contact_email) {
        chargerStationData.contact_email = clientData.contactPersonEmailAddress;
      }
      await chargerStationData.save();
    }

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
      clientId: req.body.clientId,
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

// DONE
export const deleteChargerStationHandler = async (req, res) => {
  try {
    await deleteChargerStationValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    checkClientIdAccess(req.session, req.body.clientId);

    const chargerStationId = req.params.id;
    // const { id: ChargerStationId } = req.params;

    const ChargerStation = await ChargingStationModel.findOne({
      _id: chargerStationId,
      clientId: req.body.clientId,
      isDeleted: false,
    });

    if (!ChargerStation)
      throw new CustomError(`No such user is registered with us.`);

    ChargerStation.isDeleted = true;

    await ChargerStation.save();

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

// DONE
export const listChargerStationHandler = async (req, res) => {
  try {
    await listChargerStationValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    console.log(req.query);
    const pagination = setPagination(req.query);

    if (req.query.search) {
      where = {
        ...where,
        ...{
          $or: [
            {
              station_name: new RegExp(req.query.search.toString(), "i"),
            },
            {
              "address.area": new RegExp(req.query.search.toString(), "i"),
            },
            {
              "address.city": new RegExp(req.query.search.toString(), "i"),
            },
            {
              "address.postal": new RegExp(req.query.search.toString(), "i"),
            },
          ],
        },
      };
    }

    const stations = await ChargingStationModel.find(where)
      .select("_id station_name address own_by contact_no contact_email")
      .limit(pagination.limit)
      .sort(pagination.sort)
      .skip(pagination.offset)

      .lean()
      .exec();
    // search name add

    if (!stations) throw new CustomError(`No Station found.`);
    let total_count = await ChargingStationModel.count(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: stations,
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

// DONE
export const singleChargerStationHandler = async (req, res) => {
  try {
    await singleChargerStationValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    checkClientIdAccess(req.session, req.body.clientId);

    const { id: chargerStationId } = req.params;
    let clientId = req.session.clientId || req.query.clientId;

    let where = {
      _id: chargerStationId,
      clientId: clientId,
      isDeleted: false,
    };

    const aggregationPipeline = [
      {
        $match: where,
      },
      {
        $lookup: {
          from: "chargers",
          localField: "_id",
          foreignField: "stationId",
          as: "chargerData",
          pipeline: [
            {
              $match: { isDeleted: false },
            },
            {
              $lookup: {
                from: "charger-connectors",
                localField: "_id",
                foreignField: "chargerId",
                as: "chargerConnectorData",
              },
            },
            {
              $sort: { created_at: -1 },
            },
          ],
        },
      },
    ];

    const ChargerStation = await ChargingStationModel.aggregate(
      aggregationPipeline
    );

    if (!ChargerStation.length) throw new CustomError(`No such Charger found.`);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ChargerStationDetails: ChargerStation[0] },
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
export const getChargerStationCountHandler = async (req, res) => {
  try {
    await getChargerStationValidation.validateAsync(req.body);

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    };

    let total_count = await ChargingStationModel.count(where);

    if (!total_count) throw new CustomError(`No Station found.`);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { totalStationCount: total_count },
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

    const pagination = setPagination(req.query);

    if (!req.query?.search)
      return res.status(StatusCodes.OK).send(
        responseGenerators(
          {
            paginatedData: [],
            totalCount: 0,
            itemsPerPage: pagination.limit,
          },
          StatusCodes.OK,
          "SUCCESS",
          0
        )
      );

    where = {
      ...where,
      station_name: new RegExp(req.query?.search.toString(), "i"),
    };

    const station = await ChargingStationModel.find(where)
      .select("_id station_name")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const total_count = await ChargingStationModel.countDocuments(where);
    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: station,
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
