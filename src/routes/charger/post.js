import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  createChargerValidation,
  deleteChargerValidation,
  getChargerCountValidation,
  getSerialNumberqValidation,
  listChargerValidation,
  updateChargerValidation,
} from "../../helpers/validations/charger.validation";

import {
  generateUniqueKey,
  getCurrentUnix,
  setPagination,
} from "../../commons/common-functions";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import ChargerModel from "../../models/charger";
import ClientModel from "../../models/client";
import ChargerConnectorModel from "../../models/chargerConnector";

// DONE
export const createChargerHandler = async (req, res) => {
  try {
    await createChargerValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let { serialNumber } = req.body;

    let isExits = await ChargerModel.findOne({
      serialNumber: serialNumber,
      isDeleted: false,
    });

    if (isExits) {
      let number = Number(serialNumber);
      let clientData = ClientModel.findOne({ _id: req.body.clientId }).select(
        "serialNumberCount"
      );
      if (clientData && clientData.serialNumberCount == number) {
        await ClientModel.findOneAndUpdate(
          { _id: req.body.clientId },
          { $inc: { serialNumberCount: 1 } }
        );
      }
      throw new CustomError(`Charger with given serial number already exists.`);
    }

    let chargerData = await ChargerModel.create({
      clientId: req.body.clientId,
      stationId: req.body.stationId,
      serialNumber: req.body.serialNumber,
      name: req.body.name,
      connectorCount: req.body.connectorCount,
      chargerKey: generateUniqueKey(),
      created_by: req.session._id,
      updated_by: req.session._id,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });

    let connectorData = [];

    for (const iterator of req.body.connectorDetails) {
      connectorData.push({
        clientId: req.body.clientId,
        stationId: req.body.stationId,
        serialNumber: req.body.serialNumber,
        chargerId: chargerData._id,
        connectorId: iterator.connectorId,
        pricePerUnit: iterator.pricePerUnit,
        created_by: req.session._id,
        updated_by: req.session._id,
        created_at: getCurrentUnix(),
        updated_at: getCurrentUnix(),
      });
    }

    await ChargerConnectorModel.insertMany(connectorData);

    await ClientModel.findOneAndUpdate(
      { _id: req.body.clientId },
      { $inc: { serialNumberCount: 1 } }
    );

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...chargerData.toJSON() },
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

export const getSerialNumberHandler = async (req, res) => {
  try {
    await getSerialNumberqValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    const clientData = await ClientModel.findOne({
      _id: req.body.clientId,
      isDeleted: false,
    })
      .select("serialNumberCount prefix")
      .lean()
      .exec();

    if (!clientData) {
      throw new CustomError(`Client with the given ID not found.`);
    }

    // Increment the serial number count by one
    const newSerialNumberCount = chargerData.serialNumber + 1;

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ChargerCount: newSerialNumberCount },
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

export const updateChargerHandler = async (req, res) => {
  try {
    await updateChargerValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    const chargerId = req.params.id;

    checkClientIdAccess(req.session, req.body.clientId);

    const charger = await ChargerModel.findOne({
      _id: chargerId,
      stationId: req.body.stationId,
      serialNumber: req.body.serialNumber,
      isDeleted: false,
      clientId: req.session.clientId,
    });

    if (!charger)
      throw new CustomError(
        `The Charger you are trying to update is deleted or does not exist.`
      );

    let keys = [];
    for (let key in req.body) {
      keys.push(key);
    }

    for (let i = 0; i < keys.length; ++i) {
      charger[keys[i]] = req.body[keys[i]];
    }

    charger.updated_at = getCurrentUnix();
    charger.updated_by = req.session._id;

    await charger.save();

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...charger.toJSON() },
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

export const deleteChargerHandler = async (req, res) => {
  try {
    await deleteChargerValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    checkClientIdAccess(req.session, req.body.clientId);

    const chargerId = req.params.id;
    const Charger = await ChargerModel.findOne({
      _id: chargerId,
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
    await listChargerValidation.validateAsync(req.body);

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

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

    if (req.query?.stationId) {
      where = {
        ...where,
        stationId: req.query.stationId,
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
    await listChargerValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    checkClientIdAccess(req.session, req.body.clientId);

    const chargerId = req.params.id;

    const Charger = await ChargerModel.findOne({
      _id: chargerId,
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
    await getChargerCountValidation.validateAsync({
      ...req.body,
    });

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    let total_count = await ChargerModel.count(where);

    if (req.query.status) {
      where = {
        ...where,
        status: new RegExp(req.query?.status.toString(), "i"),
      };
    }

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
