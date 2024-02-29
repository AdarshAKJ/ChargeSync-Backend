import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  createChargerValidation,
  getChargerCountValidation,
  getSerialNumberValidation,
  singleChargerValidation,
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
      maxCapacity: req.body.maxCapacity,
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

// try catch
// check validation  only client id with joi
// check client access
// get charger count from client model
// increment it by one
// and send back the response with  and charger count

export const listChargerHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pagination = setPagination(page, limit);

    const chargers = await ChargerModel.find({})
      .skip(pagination.skip)
      .limit(pagination.limit)
      .exec();

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { chargers },
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

export const getSerialNumberHandler = async (req, res) => {
  try {
    await getSerialNumberValidation.validateAsync(req.body);

    const client = await ClientModel.findOneAndUpdate(
      { _id: req?.body?.clientId },
      { $inc: { serialNumberCount: 1 } },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    return res
      .status(200)
      .json({ serialNumberCount: client.serialNumberCount });
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

export const getChargerCountHandler = async (req, res) => {
  try {
    await getChargerCountValidation.validateAsync(req.body);

    const { clientId } = req.body;

    const client = await ClientModel.findOne({ _id: clientId });

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

export const singleChargerHandler = async (req, res) => {
  try {
    await singleChargerValidation.validateAsync({ ...req.body, ...req.params });

    const { id } = req.params;

    const charger = await ChargerModel.findOne({ _id: id });

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
