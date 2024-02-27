import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  dateToUnix,
  getCurrentUnix,
  getUnixEndTime,
  getUnixStartTime,
  setPagination,
} from "../../commons/common-functions";
import TransactionModel from "../../models/transaction";
import {
  listTransactionsValidation,
  singleTransactionValidation,
} from "../../helpers/validations/transaction.validation";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import { startTransactionValidation } from "../../helpers/validations/customer.validation";
import VehicleModel from "../../models/vehicle";
import ChargerConnectorModel from "../../models/chargerConnector";
import ChargerModel from "../../models/charger";
import WalletModel from "../../models/wallet";
import WalletTransactionModel from "../../models/walletTransaction";

export const listTransactions = async (req, res) => {
  try {
    await listTransactionsValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      // isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    };

    // filters
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
        $lookup: {
          from: "chargers",
          localField: "serialNumber",
          foreignField: "serialNumber",
          as: "chargersData",
          pipeline: [
            {
              $project: {
                stationId: 1,
                name: 1,
                status: 1,
                maxCapacity: 1,
                connectorCount: 1,
                chargerKey: 1,
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
          paginatedData: transactions,
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
    await startTransactionValidation(req, res);

    let { serialNumber, connectorId, vehicleId, requestedWatts, requestTime } =
      req.body;

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

    if (requestedWatts) {
      // calculate the  amount
      let amount = (requestedWatts / 1000) * connectorData.pricePerUnit;

      // check wallet balance greater or equal to the amount.
      let walletBalance = await WalletModel.findOne({
        customerId: req.session._id,
      });

      if (!walletBalance || +walletBalance.amount < +amount)
        throw new CustomError("insufficient wallet balance");

      let preBalance = +walletBalance.amount;
      // deduce the amount
      walletBalance.amount = +walletBalance.amount - +amount;
      // add the wallet history
      await WalletTransactionModel.create({
        clientId: req.session.clientId,
        customerId: req.session._id,
        preBalance: preBalance,
        effectedBalance: +walletBalance.amount,
        amount: +amount,
        type: "DEBITED",
        reason: `Transaction started for ${amount}`,
        source: "WALLET",
        created_at: getCurrentUnix(),
        updated_at: getCurrentUnix(),
        created_by: req.session._id,
        updated_by: req.session._id,
      });

      walletBalance.updated_at = getCurrentUnix();
      walletBalance.updated_by = req.session._id;
      await walletBalance.save();

      // call the live status for charger.
      // call the transaction
      // send the response
    } else if (requestTime) {
      console.log("requestTime");
      throw new CustomError("Currently we are not supporting requestTime type");
    } else {
      throw new CustomError(
        "Please provide a valid requestedWatts or  requestTime"
      );
    }
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

export const stopTransactionHandler = async (req, res) => {
  try {
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
