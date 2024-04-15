import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";

import {
  createClientValidation,
  updateClientValidation,
} from "../../helpers/validations/client.validation";
import ClientModel from "../../models/client";
import {
  generatePublicId,
  getCurrentUnix,
  hashPassword,
  setPagination,
} from "../../commons/common-functions";
import { StatusCodes } from "http-status-codes";
import ClientUserModel from "../../models/clientUser";
import ClientWalletModel from "../../models/clientWallet";

/** This APi will create client and default client members */
export const createClient = async (req, res) => {
  try {
    await createClientValidation.validateAsync(req.body);

    const isAvailable = await ClientModel.findOne({
      username: req.body.name,
      isDeleted: false,
    })
      .lean()
      .exec();

    if (isAvailable) {
      throw new CustomError(`Client with same name or username already exist.`);
    }

    let clientUserExist = await ClientUserModel.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.contactPersonEmailAddress.toLowerCase() },
      ],
    });

    if (clientUserExist)
      throw new CustomError(
        `Client Member with same name or username already exist.`
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
      username,
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

    // Create the client
    const client = await ClientModel.create(data);

    // after creating the client, need to create the Wallet for that client
    await ClientWalletModel.create({
      _id: generatePublicId(),
      clientId: client._id,
      amount: 0,
      created_by: client._id,
      updated_by: client._id,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });

    // Create client default member and as isAdminCreated = true

    // send mail to client with url and username nad temp-password

    if (!client)
      throw new CustomError(
        `We are encountering some errors from our side. Please try again later.`
      );

    // Generate a temporary 8-digit password and hash it
    let tempPassword1;
    let tempPassword2;
    tempPassword1 = Math.random().toString(36).slice(-8);
    let hashPass = await hashPassword(tempPassword1);
    tempPassword2 = hashPass;

    let contactPersonParts = contactPerson.split(" ");
    // Create a default ClientUser for the client
    const defaultClientUser = await ClientUserModel.create({
      clientId: client._id,
      username,
      password: tempPassword2,
      isAdminCreated: true,
      roleId: "ADMIN",
      fname: contactPersonParts[0],
      lname: contactPersonParts.slice(1).join(" ") || contactPersonParts[0],
      email: contactPersonEmailAddress.toLowerCase(),
      phoneNumber: contactPersonPhoneNumber,
      countryCode: countryCode,
    });

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...client.toJSON(), defaultClientUser, password: tempPassword1 },
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

/** Update Client API */
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

/** API to provide client name for selection box with id */
export const getClientSelectHandler = async (req, res) => {
  try {
    const pagination = setPagination(req.query);

    const where = {
      isDeleted: false,
      clientId: req?.query?.clientId,
    };

    // Fetch clients from the database with pagination
    const clients = await ClientModel.find(where)
      .select("_id name") // Select only _id and name fields
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    const totalCount = await ClientModel.countDocuments(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          clients: clients,
          totalCount: totalCount,
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
