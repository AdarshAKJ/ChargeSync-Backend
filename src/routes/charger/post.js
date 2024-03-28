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
import {
  chargerAvailableConnectorsValidation,
  chargerClientIdValidation,
  chargerOfflineOnlineValidation,
  getChargerSelectValidation,
} from "../../helpers/validations/customer.validation";

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

    const client = await ClientModel.find(where)
      .select("prefix serialNumberCount")
      .lean()
      .exec();

    if (!client || !client.length) {
      return res.status(404).json({ error: "Client not found" });
    }

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        [
          {
            ...client[0],
            serialNumberCount: +client[0].serialNumberCount + 1,
          },
        ],
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
      _id: req.params.id,
      isDeleted: false,
      clientId: req.body.clientId || req.session.clientId,
    };

    const aggregationPipeline = [
      {
        $match: where,
      },
      {
        $lookup: {
          from: "charger-connectors",
          localField: "_id",
          foreignField: "chargerId",
          as: "ChargerConnectorData",
          pipeline: [
            {
              $match: {
                isDeleted: false, // Add this condition to filter charger-connectors
              },
            },
            {
              $project: {
                _id: 1,
                connectorType: 1,
                pricePerUnit: 1,
                connectorId: 1,
              },
            },
          ],
        },
      },
    ];

    const charger = await ChargerModel.aggregate(aggregationPipeline);

    if (!charger || charger.length <= 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Charger not found" });
    }

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          singlechargerData: charger[0],
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

    let charger = await ChargerModel.findOne({
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

    // check the charger connector count.
    let connectorCount = await ChargerConnectorModel.countDocuments({
      chargerId: charger._id,
    });

    //if count is mismatch then throw an error
    if (req.body.connectorDetails.length != connectorCount)
      throw new CustomError(`You cannot add or delete the new connector.`);

    let reqData = { ...req.body };
    // delete connectorDetails
    delete reqData.connectorDetails;

    // update each connector for the charger
    let connectorData = [];
    for (const singleConnector of req.body.connectorDetails) {
      let singleUpdatedConnector = await ChargerConnectorModel.findOneAndUpdate(
        {
          chargerId: charger._id,
          connectorId: singleConnector.connectorId,
        },
        {
          connectorId: singleConnector.connectorId,
          connectorType: singleConnector.connectorType,
          pricePerUnit: singleConnector.pricePerUnit,
        },
        { new: true }
      );
      connectorData.push(singleUpdatedConnector);
    }

    let keys = [];
    for (let key in reqData) {
      keys.push(key);
    }

    for (let i = 0; i < keys.length; ++i) {
      charger[keys[i]] = req.body[keys[i]];
    }

    charger.updated_at = getCurrentUnix();
    charger.updated_by = req.session._id;

    await charger.save();
    charger = charger.toJSON();
    charger = { ...charger, connectorDetails: connectorData };

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(charger, StatusCodes.OK, "SUCCESS", 0));
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

    checkClientIdAccess(req?.session, req?.body?.clientId);

    let where = {
      isDeleted: false,
      clientId: req?.session?.clientId || req?.body?.clientId,
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
      name: new RegExp(req.query?.search.toString(), "i"),
    };

    const charger = await ChargerModel.find(where)
      .select("serialNumber name")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const total_count = await ChargerModel.countDocuments(where);
    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: charger,
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

// available connector for charger
export const chargerAvailableConnectorsHandler = async (req, res) => {
  try {
    await chargerAvailableConnectorsValidation.validateAsync(req.body);

    // checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      serialNumber: req.body.serialNumber,
    };

    const pagination = setPagination(req.query);

    const aggregationPipeline = [
      {
        $match: where,
      },
      {
        $project: {
          _id: 1,
          status: 1,
          name: 1,
        },
      },
      {
        $lookup: {
          from: "charger-connectors",
          localField: "_id",
          foreignField: "chargerId",
          as: "chargerConnectorData",
          pipeline: [
            {
              $match: { isDeleted: false },
            },
            {
              $project: {
                _id: 1,
                status: 1,
                connectorId: 1,
              },
            },
          ],
        },
      },
    ];

    const chargerData = await ChargerModel.aggregate(aggregationPipeline)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit);

    let total_count = await ChargerModel.count(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: chargerData,
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

// Get Client Id by Serial Number
export const chargerClientIdHandler = async (req, res) => {
  try {
    await chargerClientIdValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      serialNumber: req.body.serialNumber,
    };

    const chargerData = await ChargerModel.findOne(where).select("clientId");

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          chargerData: chargerData,
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

// Check charger is online or offline.
export const chargerOfflineOnlineHandler = async (req, res) => {
  try {
    await chargerOfflineOnlineValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      serialNumber: req.body.serialNumber,
    };

    const chargerData = await ChargerModel.findOne(where).select("status");

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          chargerclientId: chargerData,
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

export const getClientDetailsBySerialNumberHandler = async (req, res) => {
  try {
    if (!req.params.serialNumber)
      throw new CustomError(`Please provide a serial number`);

    let where = {
      isDeleted: false,
      serialNumber: req.params.serialNumber,
    };

    const chargerData = await ChargerModel.findOne(where)
      .select("clientId", "serialNumber")
      .lean()
      .exec();

    if (!chargerData) throw new CustomError(`Charger not found`);

    const clientData = await ClientModel.findOne({
      _id: chargerData.clientId,
    })
      .select("_id name")
      .lean()
      .exec();

    if (!clientData) throw new CustomError(`Client not found`);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          clientId: clientData._id,
          clientName: clientData.name,
          serialNumber: req.params.serialNumber,
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
