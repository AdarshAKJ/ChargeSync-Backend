import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  dateToUnix,
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
    await singleTransactionValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
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
