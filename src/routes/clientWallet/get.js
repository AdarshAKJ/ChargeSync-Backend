import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import { setPagination } from "../../commons/common-functions";
import ClientWalletTransactionModel from "../../models/clientWalletTransaction";

export const listWalletClientlistHandler = async (req, res) => {
  try {
    let where = {
      isDeleted: false,
    };
    if (req.session.superAdmin) {
      if (req.body?.clientId) {
        where = {
          ...where,
          clientId: req.body.clientId,
        };
      }
    } else {
      where = {
        ...where,
        clientId: req.body.clientId,
      };
    }

    const pagination = setPagination(req.query);

    const ClientWalletTransactionData = await ClientWalletTransactionModel.find(
      where
    )
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    let total_count = await ClientWalletTransactionModel.count(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: ClientWalletTransactionData,
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
