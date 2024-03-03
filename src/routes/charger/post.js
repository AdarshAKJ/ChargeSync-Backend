import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  createChargerValidation,
  deleteChargerValidation,
  getChargerCountValidation,
  getSerialNumberValidation,
  listChargerValidation,
  singleChargerValidation,
  updateChargerValidation,
  updateConnectorPricePerUnitValidation,
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
import { getChargerSelectValidation } from "../../helpers/validations/customer.validation";

// DONE
export const createChargerHandler = async (req, res) => {
  try {
    await createChargerValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let { serialNumber, prefix } = req.body;

    let isExits = await ChargerModel.findOne({
      serialNumber: prefix + serialNumber,
      isDeleted: false,
    });

    if (isExits) {
      let number = Number(serialNumber);
      if (!isNaN) {
        let clientData = ClientModel.findOne({ _id: req.body.clientId }).select(
          "serialNumberCount"
        );
        if (clientData && clientData.serialNumberCount == number) {
          await ClientModel.findOneAndUpdate(
            { _id: req.body.clientId },
            { $inc: { serialNumberCount: 1 } }
          );
        }
      }
      throw new CustomError(`Charger with given serial number already exists.`);
    }

    let chargerData = await ChargerModel.create({
      clientId: req.body.clientId,
      stationId: req.body.stationId,
      serialNumber: prefix + serialNumber,
      name: req.body.name,
      connectorCount: req.body.connectorCount,
      maxCapacity: +req.body.maxCapacity,
      powerType: req.body.powerType,
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
        // serialNumber: req.body.serialNumber,
        chargerId: chargerData._id,
        connectorId: iterator.connectorId,
        pricePerUnit: +iterator.pricePerUnit,
        connectorType: iterator.connectorType,
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

// list charger
export const listChargerHandler = async (req, res) => {
  try {
    await listChargerValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    };

    const { page = 1, limit = 10 } = req.query;
    const pagination = setPagination(page, limit);

    const chargers = await ChargerModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort(pagination.sort)
      .exec();

    const total_count = await ChargerModel.count(where);
    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: chargers,
          totalCount: total_count,
          itemsPerPage: pagination.limit,
        },
        StatusCodes.OK,
        "Chargers fetched successfully",
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

// get serial number
export const getSerialNumberHandler = async (req, res) => {
  try {
    await getSerialNumberValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      _id: req.session.clientId || req.body.clientId,
    };

    const client = await ClientModel.find(where).select(
      "prefix serialNumberCount"
    );

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(client, StatusCodes.OK, "SUCCESS", 0));
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

// get charger count
export const getChargerCountHandler = async (req, res) => {
  try {
    await getChargerCountValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      _id: req.session.clientId || req.body.clientId,
    };

    const client = await ClientModel.findOne(where);

    if (!client) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Client not found" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ chargerCount: client.serialNumberCount });
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

/// get single charger.
export const singleChargerHandler = async (req, res) => {
  try {
    await singleChargerValidation.validateAsync({ ...req.body, ...req.params });
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    };

    const charger = await ChargerModel.findOne(where);

    if (!charger) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Charger not found" });
    }

    return res.status(StatusCodes.OK).json({ charger });
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
      clientId: req.body.clientId,
      isDeleted: false,
    });

    if (!Charger)
      throw new CustomError(`No such charger is registered with us.`);

    if (Charger.status === "ONLINE")
      throw new CustomError(
        `Charger cannot be deleted while it is still connected. Please disconnect the charger before attempting to delete.`
      );

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

// update charger
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
      clientId: req.body.clientId,
      isDeleted: false,
    });

    if (!charger)
      throw new CustomError(
        `The charger you are trying to update is deleted or does not exist.`
      );

    if (charger.status === "ONLINE")
      throw new CustomError(
        `Charger cannot be update while it is still connected. Please disconnect the charger before attempting to update.`
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

export const updateConnectorPricePerUnitHandler = async (req, res) => {
  try {
    await updateConnectorPricePerUnitValidation.validateAsync(req.body);

    let charger = await ChargerModel.findOne({
      _id: req.body.chargerId,
      clientId: req.session.clientId,
      isDeleted: false,
    });

    if (!charger)
      throw new CustomError(
        `The charger you are trying to update is deleted or does not exist.`
      );

    if (charger.status === "ONLINE")
      throw new CustomError(
        `Charger cannot be update while it is still connected. Please disconnect the charger before attempting to update.`
      );

    for (const iterator of req.body.connectorDetails) {
      let connectorData = await ChargerConnectorModel.findOneAndUpdate(
        { _id: iterator.connectorId },
        {
          connectorType: iterator.connectorType,
          pricePerUnit: +iterator.pricePerUnit,
        },
        { new: true }
      );

      if (!connectorData)
        throw new CustomError(`Connector for given charger not found.`);
    }

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          null,
          StatusCodes.OK,
          "Connector updated successfully",
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
