import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { setPagination } from "../../commons/common-functions";
import TransactionModel from "../../models/transaction";
import { listChargerStationValidation } from "../../helpers/validations/charger.station.validation";

export const listTransactions = async (req, res) => {
  try {
    await listChargerStationValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    };
    // filtures
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

    // pagination
    const pagination = setPagination(req.query);
    const transactions = await TransactionModel.find(where)
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
