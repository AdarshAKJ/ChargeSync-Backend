import MessageModel from '../../models/messages';
import { ValidationError } from 'webpack';
import { CustomError } from '../../helpers/custome.error';
import { StatusCodes } from 'http-status-codes';
import { responseGenerators } from '../../lib/utils';
import { cidmessageValidation, messageValidation } from '../../helpers/validations/messages.validation';


export const readUpdateMessageHandler = async (req, res) => {
  try {
    await messageValidation.validateAsync(req.body);
      
    const clientId = req?.session?.clientId;
    const messageIds = req?.body?.messageIds;

    const messages = await MessageModel.find({ _id: { $in: messageIds }, clientId });

    if (messages.length !== messageIds.length) {
      throw new CustomError(`Some messages not found.`);
    }

    await MessageModel.updateMany({ _id: { $in: messageIds } }, { $set: { isRead: true } });

    return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, "Messages status updated successfully", 0));

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
    await cidmessageValidation.validateAsync(req.body);
    const { clientId, page = 1, limit = 10 } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { created_at: -1 }
    };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = { clientId, isRead: false };

    const messages = await MessageModel.find(where)
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit)
      .lean()
      .exec();

    if (!messages || messages.length === 0) {
      throw new CustomError(`No unread messages found.`);
    }

    const total_count = await MessageModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: messages,
          totalCount: total_count,
          itemsPerPage: options.limit,
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
  
