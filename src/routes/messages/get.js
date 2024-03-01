import MessageModel from '../../models/messages';
import { ValidationError } from 'webpack';
import { CustomError } from '../../helpers/custome.error';
import { StatusCodes } from 'http-status-codes';
import { responseGenerators } from '../../lib/utils';
import Joi from 'joi';

/*export const getMessageHandler = async (req, res) => {
  try {
    await createClientUserValidation.validateAsync(req.query);
    const { clientId, page = 1, limit = 10 } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { created_at: -1 } 
    };
    const messages = await MessageModel.paginate({ clientId }, options);
    res.json(messages);
  }
   catch (error) {
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

export const readMessageHandler = async (req, res) => {
  try {
    await createClientUserValidation.validateAsync(req.params);
    const { messageId } = req.params._id;
    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);

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
};*/


export const readUpdateMessageHandler = async (req, res) => {
  try {
    const schema = Joi.object({
      clientId: Joi.string().required(),
      messageIds: Joi.array().items(Joi.string()).min(1).max(100).required()
    });

    const { error, value } = schema.validate({
      clientId: req.session.clientId,
      messageIds: req.body.messageIds
    });

    if (error) {
      throw new CustomError(error.message);
    }

    const { clientId, messageIds } = value;

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
  
