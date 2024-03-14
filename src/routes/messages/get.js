import MessageModel from "../../models/messages";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import {
  cidMessageValidation,
  messageValidation,
} from "../../helpers/validations/messages.validation";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";

export const readUpdateMessageHandler = async (req, res) => {
  try {
    //validation
    await messageValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);
    const { clientId } = req.body || req.session;
    const messageIds = req?.body?.messageIds;

    // find all messages
    const messages = await MessageModel.find({
      _id: { $in: messageIds },
      clientId: clientId,
    });

    // res.json({messages})

    // if messages count miss match
    if (messages.length !== messageIds.length) {
      throw new CustomError(`Some messages not found.`);
    }

    // update message
    await MessageModel.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isRead: true, updated_at: getCurrentUnix() } }
    );

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          {},
          StatusCodes.OK,
          "Messages status updated successfully",
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

export const listUnreadMessagesHandler = async (req, res) => {
  try {
    await cidMessageValidation.validateAsync(req.body);
    const { clientId } = req.body;
    checkClientIdAccess(req.session, req.body.clientId);
    let paginatedData = setPagination(req.query);

    const where = { clientId, isRead: false };

    const messages = await MessageModel.find(where)
      .select("message isPreserved isRead title created_at")
      .sort(paginatedData.sort)
      .skip(paginatedData.skip)
      .limit(paginatedData.limit)
      .lean()
      .exec();

    const total_count = await MessageModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: messages,
          totalCount: total_count,
          itemsPerPage: paginatedData.limit,
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

export const listPreservedMessagesHandler = async (req, res) => {
  try {
    await cidMessageValidation.validateAsync(req.body);
    const { clientId } = req.body;
    checkClientIdAccess(req.session, req.body.clientId);
    let paginatedData = setPagination(req.query);
    const where = { clientId, isPreserved: true };
    const messages = await MessageModel.find(where)
      .select("message isPreserved isRead title created_at")
      .sort(paginatedData.sort)
      .skip(paginatedData.skip)
      .limit(paginatedData.limit)
      .lean()
      .exec();

    const total_count = await MessageModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: messages,
          totalCount: total_count,
          itemsPerPage: paginatedData.limit,
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
