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
  customerTransactionsValidation,
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
  MENTANENCE_MESSAGE,
} from "../../commons/global-constants";

import MaintenanceModel from "../../models/maintenance";
import { AxiosError } from "axios";

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
      where.createdAt = {
        $gte: getUnixStartTime(dateToUnix(req.query.startDate)),
      };
    }
    if (req?.query?.endDate) {
      where.createdAt = {
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
          serialNumber: req.body.idid,
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

export const singleTransaction = async (req, res) => {
  try {
    await singleTransactionValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      _id: req.body.id,
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    };

    const aggregationPipeline = [
      {
        $match: where,
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
        $unwind: "$chargerConnectorsData",
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
    await singlecustomerTransactionsValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
      customerId: req.body.id,
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

    // calculate the  amount
    let amount = (requestedWatts / 1000) * connectorData.pricePerUnit;

    // check wallet balance greater or equal to the amount.
    let walletBalance = await WalletModel.findOne({
      customerId: req.session._id,
    });

    // check for wallet balance insufficient
    if (!walletBalance || +walletBalance.amount < +amount)
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

    let preBalance = +walletBalance.amount;
    // deduce the amount
    walletBalance.amount = +walletBalance.amount - +amount;
    // add the wallet history
    let walletTransactionData = await WalletTransactionModel.create({
      clientId: req.session.clientId,
      customerId: req.session._id,
      preBalance: preBalance,
      effectedBalance: +walletBalance.amount,
      amount: +amount,
      type: "DEBITED",
      reason: `Transaction deducted for transaction :- ${transactionData?.data?.transactionId}`,
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
    await TransactionModel.findOneAndUpdate(
      { _id: transactionData.data._id },
      { walletTransactionId: walletTransactionData._id, deductedAmount: amount }
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

export const stopTransactionHandler = async (req, res) => {
  try {
    await stopTransactionValidation(req.body);
    let { serialNumber, transactionId } = req.body;

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
    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(stopTransaction, StatusCodes.OK, "SUCCESS", 0));
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
