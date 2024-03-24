import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";

import {
  createClientValidation,
  updateClientValidation,
} from "../../helpers/validations/client.validation";
import ClientModel from "../../models/client";
import { getCurrentUnix } from "../../commons/common-functions";
import { StatusCodes } from "http-status-codes";

//DONE
export const createClient = async (req, res) => {
  try {
    await createClientValidation.validateAsync(req.body);
    const isAvailable = await ClientModel.findOne({
      name: req.body.name,
      isDeleted: false,
    })
      .lean()
      .exec();

    if (isAvailable)
      throw new CustomError(
        `The user you are trying to create is already registered.`
      );

    const {
      name,
      contactPerson,
      contactPersonEmailAddress,
      contactPersonPhoneNumber,
      countryCode,
      address,
      documents,
      prefix,
    } = req.body;

    let data = {
      name,
      contactPerson,
      prefix: prefix.toUpperCase(),
      contactPersonEmailAddress: contactPersonEmailAddress.toLowerCase(),
      contactPersonPhoneNumber,
      countryCode,
      address,
      documents,
      subscriptionId: "kwrgfvwhkfkwhgcjhd",
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
      updated_by: req.session._id,
      created_by: req.session._id,
    };

    const client = await ClientModel.create(data);

    // Create client default member and as isAdminCreated = true

    // send mail to client with url and username nad temp-password

    if (!client)
      throw new CustomError(
        `We are encountering some errors from our side. Please try again later.`
      );

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators({ ...client.toJSON() }, StatusCodes.OK, "SUCCESS", 0)
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

export const updateClient = async (req, res) => {
  try {
    await updateClientValidation.validateAsync(req.body);
    const clientId = req.params.id;
    const client = await ClientModel.findOne({
      _id: clientId,
      isDeleted: false,
    });

    if (!client)
      throw new CustomError(
        `The client you are trying to update is deleted or does not exist.`
      );

    // ? any key handling that cannot be updated should be handled here i.e. email, contact
    // if(req.body.email) throw new CustomError(`email cannot be updated.`);

    let keys = [];
    for (let key in req.body) {
      keys.push(key);
    }

    for (let i = 0; i < keys.length; ++i) {
      client[keys[i]] = req.body[keys[i]];
    }

    await client.save();
    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators({ ...client.toJSON() }, StatusCodes.OK, "SUCCESS", 0)
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
