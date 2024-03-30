import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  dateToUnix,
  delay,
  getCurrentUnix,
  getUnixEndTime,
  getUnixStartTime,
  setPagination,
} from "../../commons/common-functions";
import TransactionModel from "../../models/transaction";
import {
  currentActiveValidation,
  customerTransactionsValidation,
  getCostValidation,
  inprogressTransactionHistoryValidation,
  listTransactionsValidation,
  singleTransactionValidation,
  singlecustomerTransactionsValidation,
} from "../../helpers/validations/transaction.validation";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import {
  startTransactionValidation,
  stopTransactionValidation,
} from "../../helpers/validations/customer.validation";
import VehicleModel from "../../models/vehicle";
import ChargerConnectorModel from "../../models/chargerConnector";
import ChargerModel from "../../models/charger";
import WalletModel from "../../models/wallet";
import WalletTransactionModel from "../../models/walletTransaction";
import { callAPI } from "../../helpers/api";
import {
  CONNECTOR_MESSAGE,
  ERROR,
  MENTANENCE_MESSAGE,
  NOTIFICATION_MESSAGE,
  NOTIFICATION_TITLE,
} from "../../commons/global-constants";

import MaintenanceModel from "../../models/maintenance";
import { AxiosError } from "axios";
import { sendNotification } from "../messages/common";
import configVariables from "../../../config";

// list transactions
export const listTransactions = async (req, res) => {
  try {
    await listTransactionsValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      clientId: req.session.clientId || req.body.clientId,
    };

    // filters
    if (req.query?.status) {
      where = {
        ...where,
        status: new RegExp(req.query?.status.toString(), "i"),
      };
    }

    if (req?.query?.startDate) {
      where.created_at = {
        $gte: getUnixStartTime(dateToUnix(req.query.startDate)),
      };
    }

    if (req?.query?.endDate) {
      where.created_at = {
        $lte: getUnixEndTime(dateToUnix(req.query.endDate)),
      };
    }
    if (req?.query?.startDate && req?.query?.endDate) {
      where.created_at = {
        $gte: getUnixStartTime(dateToUnix(req.query.startDate)),
        $lte: getUnixEndTime(dateToUnix(req.query.endDate)),
      };
    }

    if (req.body?.key) {
      if (!req.body?.id) throw new CustomError(`Please Provide id.`);

      if (req.body.key === "CUSTOMER") {
        where = {
          ...where,
          customerId: req.body.id,
        };
      } else if (req.body.key === "CHARGER") {
        where = {
          ...where,
          serialNumber: req.body.id,
        };
      } else if (req.body.key === "STATION") {
        where = {
          ...where,
          stationId: req.body.id,
        };
      }
    }

    const pagination = setPagination(req.query);

    const aggregationPipeline = [
      {
        $match: where,
      },
      {
        $lookup: {
          from: "charging-stations",
          localField: "stationId",
          foreignField: "_id",
          as: "stationData",
          pipeline: [
            {
              $project: {
                station_name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "chargerConnectors",
          localField: "connectorId",
          foreignField: "_id",
          as: "chargerConnectorsData",
          pipeline: [
            {
              $project: {
                connectorId: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerData",
          pipeline: [
            {
              $project: {
                _id: 1,
                fname: 1,
                lname: 1,
                phoneNumber: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleData",
          pipeline: [
            {
              $project: {
                name: 1,
                vehicleNumber: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "chargers",
          localField: "serialNumber",
          foreignField: "serialNumber",
          as: "chargerData",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $sort: pagination.sort,
      },
      {
        $skip: pagination.offset,
      },
      {
        $limit: pagination.limit,
      },
    ];

    const transactions = await TransactionModel.aggregate(aggregationPipeline);

    if (!transactions) throw new CustomError(`No transactions found.`);

    let total_count = await TransactionModel.count(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: transactions,
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

// get single transaction
export const singleTransaction = async (req, res) => {
  try {
    await singleTransactionValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      _id: req.params.id,
      clientId: req.session.clientId || req.body.clientId,
    };

    const aggregationPipeline = [
      {
        $match: where,
      },
      {
        $lookup: {
          from: "charging-stations",
          localField: "stationId",
          foreignField: "_id",
          as: "stationData",
          pipeline: [
            {
              $project: {
                station_name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "chargerConnectors",
          localField: "connectorId",
          foreignField: "_id",
          as: "chargerConnectorsData",
          pipeline: [
            {
              $project: {
                connectorId: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerData",
          pipeline: [
            {
              $project: {
                _id: 1,
                fname: 1,
                lname: 1,
                phoneNumber: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleData",
          pipeline: [
            {
              $project: {
                name: 1,
                vehicleNumber: 1,
              },
            },
          ],
        },
      },
    ];

    const transactions = await TransactionModel.aggregate(aggregationPipeline);

    if (!transactions) throw new CustomError(`No transactions found.`);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          transactionData: transactions,
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

export const customerTransactionsHandler = async (req, res) => {
  try {
    await customerTransactionsValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
      customerId: req.body.id,
    };

    if (req.query?.status) {
      where = {
        ...where,
        status: new RegExp(req.query?.status.toString(), "i"),
      };
    }

    if (req.query?.connectorId) {
      where = {
        ...where,
        connectorId: new RegExp(req.query.connectorId.toString(), "i"),
      };
    }

    if (req?.query?.startDate) {
      where.createdAt = {
        $gte: getUnixStartTime(dateToUnix(req.query.startDate)),
      };
    }
    if (req?.query?.endDate) {
      where.createdAt = {
        $lte: getUnixEndTime(dateToUnix(req.query.endDate)),
      };
    }
    const pagination = setPagination(req.query);

    const transactions = await TransactionModel.findOne(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    if (!transactions) throw new CustomError(`No transactions found.`);

    let total_count = await TransactionModel.count(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: transactions,
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

export const singlecustomerTransactionsHandler = async (req, res) => {
  try {
    await singlecustomerTransactionsValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      clientId: req.session.clientId || req.body.clientId,
      customerId: req.session._id,
      _id: req.params.id,
    };

    const transactions = await TransactionModel.findOne(where).lean().exec();

    if (!transactions) throw new CustomError(`No transactions found.`);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          transactionData: transactions,
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

// real time transaction history
export const inProgressTransactionHistoryHandler = async (req, res) => {
  try {
    await inprogressTransactionHistoryValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId,
      serialNumber: req.body.serialNumber,
      status: "InProgress",
    };

    let transactions = await TransactionModel.find(where).lean().exec();

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          transactionData: transactions,
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

// Get cost for charging
export const getCostHandler = async (req, res) => {
  try {
    await getCostValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId,
      _id: req.body.connectorId,
    };

    let costData = await ChargerConnectorModel.findOne(where)
      .select("pricePerUnit")
      .lean()
      .exec();

    if (!costData) throw new CustomError(`Connect not found.`);

    const requireWatt = +req.body.requireWatt / 1000;

    let estimatedCost = +costData.pricePerUnit * +requireWatt;

    estimatedCost = (estimatedCost * +process.env.TAX) / 100 + estimatedCost;

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          estimatedCost: estimatedCost,
          perUnitPrice: +costData.pricePerUnit,
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

// current active transaction
export const currentActiveTransactionHandler = async (req, res) => {
  try {
    await currentActiveValidation.validateAsync(req.body);

    let where = {
      clientId: req.session.clientId,
      connectorId: req.body.connectorId,
      serialNumber: req.body.serialNumber,
      status: "InProgress",
    };

    const aggregationPipeline = [
      {
        $match: where,
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerData",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                fname: 1,
                lname: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          currentMeterReadingTime: 1,
          customerData: 1,
        },
      },
    ];

    const transactionData = await TransactionModel.aggregate(
      aggregationPipeline
    );

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          transactionData: transactionData,
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

// start transaction.
export const startTransactionHandler = async (req, res) => {
  try {
    await startTransactionValidation.validateAsync(req.body);

    let { serialNumber, connectorId, vehicleId, requestedWatts } = req.body;

    // maintenance check.
    let maintenanceData = await MaintenanceModel.findOne({ status: "ACTIVE" });
    if (maintenanceData) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators(
            {},
            StatusCodes.BAD_REQUEST,
            `${MENTANENCE_MESSAGE.UNDER_MENTANANCE}${maintenanceData.endDate}`,
            1
          )
        );
    }

    // check vehicle exists
    let isVehicle = await VehicleModel.findOne({
      _id: vehicleId,
      clientId: req.session.clientId,
      customerId: req.session._id,
    });

    if (!isVehicle) throw new CustomError("Please provide a valid vehicle Id");

    // check charger exits
    let chargerData = await ChargerModel.findOne({
      serialNumber: serialNumber,
      clientId: req.session.clientId,
    });

    if (!chargerData)
      throw new CustomError("Please provide a valid serialNumber");

    // check connector exists
    let connectorData = await ChargerConnectorModel.findOne({
      _id: connectorId,
      clientId: req.session.clientId,
    });

    if (!connectorData)
      throw new CustomError("Please provide a valid connector id");

    let amount = (requestedWatts / 1000) * connectorData.pricePerUnit;

    // Calculate the  amount.
    let amountWithTax = (amount * +configVariables.TAX) / 100 + amount;

    // Check wallet balance greater or equal to the amount.
    let walletBalance = await WalletModel.findOne({
      customerId: req.session._id,
    });

    // check for wallet balance insufficient
    if (!walletBalance || +walletBalance.amount < +amountWithTax)
      throw new CustomError("Insufficient wallet balance");

    // call the live status for charger.
    let chargerStatusData = await callAPI(
      "POST",
      process.env.CHARGER_STATUS_API_URL,
      {
        connectorId: connectorId, // database id
        serialNumber: serialNumber,
        ocppConnectorId: +connectorData.connectorId,
      },
      {
        "private-api-key": process.env.OCPP_API_KEY,
      }
    );

    // API success
    if (chargerStatusData?.code != 200) {
      sendNotification(
        NOTIFICATION_TITLE.chargerOffline,
        NOTIFICATION_MESSAGE.chargerOfflineWhileTransaction(serialNumber),
        req.session.clientId
      );
      throw new CustomError(`Charger is offline`);
    }

    await delay(5000);

    // check for connector status
    let updatedConnectorData = await ChargerConnectorModel.findOne({
      _id: connectorId,
    })
      .select("status errorCode")
      .lean()
      .exec();

    // check the charger connector status
    if (
      updatedConnectorData.status != "Available" ||
      updatedConnectorData.errorCode != "NoError"
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators(
            {},
            StatusCodes.BAD_REQUEST,
            CONNECTOR_MESSAGE.NOT_ACTIVE,
            1
          )
        );
    }
    // call the transaction
    let transactionData = await callAPI(
      "POST",
      process.env.START_TRANSACTION_API_URL,
      {
        serialNumber: serialNumber,
        customerId: req.session._id,
        vehicleId: vehicleId,
        connectorId: connectorId,
        connectorOCPPId: Number(connectorData.connectorId),
        clientId: req.session.clientId,
        requestedWatts: requestedWatts,
        requiredTime: null,
        pricePerUnit: connectorData.pricePerUnit,
        stationId: connectorData.stationId,
      },
      {
        "private-api-key": process.env.OCPP_API_KEY,
      }
    );

    // if transaction API failed then notify client.
    if (transactionData?.code != 200) {
      sendNotification(
        NOTIFICATION_TITLE.transactionAPIFailed,
        NOTIFICATION_MESSAGE.transactionAPIFailingFor(serialNumber),
        req.session.clientId,
        null,
        null,
        true
      );
      throw new CustomError(ERROR.SERVER_DOWN);
    }

    let preBalance = +walletBalance.amount;
    // deduce the amount
    walletBalance.amount = +walletBalance.amount - +amountWithTax;
    // add the wallet history
    let walletTransactionData = await WalletTransactionModel.create({
      clientId: req.session.clientId,
      customerId: req.session._id,
      preBalance: preBalance,
      effectedBalance: +walletBalance.amount,
      amount: +amountWithTax,
      type: "DEBITED",
      reason: `Credit deducted for transaction :- ${transactionData?.data?.transactionId}`,
      source: "WALLET",
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
      created_by: req.session._id,
      updated_by: req.session._id,
    });

    // wallet updated for deduction
    walletBalance.updated_at = getCurrentUnix();
    walletBalance.updated_by = req.session._id;
    await walletBalance.save();

    console.log(
      "Wallet updated for transaction: " + transactionData?.data?.transactionId
    );

    // update transaction for wallet transaction id
    // with wallet transaction id and amount
    await TransactionModel.findOneAndUpdate(
      { _id: transactionData.data._id },
      {
        walletTransactionId: walletTransactionData._id,
        amount: amount,
        tax: configVariables.TAX,
        totalCost: amountWithTax,
        updated_at: getCurrentUnix(),
        updated_by: req.session._id,
      }
    );

    // Transaction started notification
    sendNotification(
      NOTIFICATION_TITLE.transactionStarted,
      NOTIFICATION_MESSAGE.transactionStarted(
        transactionData?.data?.transactionId
      ),
      req.session.clientId
    );
    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(transactionData.data, StatusCodes.OK, "SUCCESS", 0)
      );
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof CustomError ||
      error instanceof AxiosError
    ) {
      if (error instanceof AxiosError) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(
            responseGenerators(
              {},
              StatusCodes.BAD_REQUEST,
              error.response.data.message,
              1
            )
          );
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(
            responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
          );
      }
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

// stop the transaction
export const stopTransactionHandler = async (req, res) => {
  try {
    await stopTransactionValidation.validateAsync(req.body);
    let { serialNumber, transactionId, customerReason } = req.body;

    // check for transaction.
    let tData = await TransactionModel.findOne({
      serialNumber: serialNumber,
      occpTransactionId: transactionId,
    }).select("_id serialNumber occpTransactionId status");

    // check exits
    if (!tData) throw new CustomError("Transaction not found.");
    // check status
    if (tData.status != "InProgress")
      throw new CustomError("No Active transactions found.");

    // call the live status for charger.
    let stopTransaction = await callAPI(
      "POST",
      process.env.STOP_TRANSACTION_API_URL,
      {
        transactionId,
        serialNumber,
      },
      {
        "private-api-key": process.env.OCPP_API_KEY,
      }
    );

    if (stopTransaction?.code != 200) {
      sendNotification(
        NOTIFICATION_TITLE.stopTransactionFailed,
        NOTIFICATION_MESSAGE.stopTransactionFailed(serialNumber),
        req.session.clientId
      );
      throw new CustomError(
        `Failed to stop transaction, Please trigger Emergency stop`
      );
    }

    sendNotification(
      NOTIFICATION_TITLE.transactionStopped,
      NOTIFICATION_MESSAGE.transactionStopped(transactionId),
      req.session.clientId
    );

    await TransactionModel.findOneAndUpdate(
      { serialNumber: serialNumber, occpTransactionId: transactionId },
      {
        customerReason: customerReason || "Manually stopped transaction.",
        updated_at: getCurrentUnix(),
        updated_by: req.session._id,
      }
    );
    // notifications for transaction stop // TO DO
    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(stopTransaction?.data, StatusCodes.OK, "SUCCESS", 0)
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
