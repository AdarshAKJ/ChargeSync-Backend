import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";

import {
  createClientValidation,
  updateClientValidation,
} from "../../helpers/validations/client.validation";
import ClientModel from "../../models/client";
import { getCurrentUnix, hashPassword, setPagination } from "../../commons/common-functions";
import { StatusCodes } from "http-status-codes";
import ClientUserModel from "../../models/clientUser";



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
      username,
    } = req.body;

    let tempPassword1
    let tempPassword2

    // Generate a temporary 8-digit password and hash it
    tempPassword1 = Math.random().toString(36).slice(-8);
    let hashPass = await hashPassword(tempPassword1);
    tempPassword2 = hashPass;
    

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

    // Create client default member and as isAdminCreated = true

    // send mail to client with url and username nad temp-password

    if (!client)
      throw new CustomError(
        `We are encountering some errors from our side. Please try again later.`
      );

      let contactPersonParts = contactPerson.split(" ");
    // Create a default ClientUser for the client
    const defaultClientUser = await ClientUserModel.create({
      clientId: client._id,
      username,
      password: tempPassword2,
      isAdminCreated: true,
      roleId:"ADMIN",
      fname: contactPersonParts[0],
      lname: contactPersonParts.slice(1).join(" "),
      email: contactPersonEmailAddress,
      phoneNumber: contactPersonPhoneNumber,
      countryCode: countryCode,
    });

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        { ...client.toJSON(), defaultClientUser, password : tempPassword1},
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


//Create Client API
// export const createClient = async (req, res) => {
//   try {
//     await createClientValidation.validateAsync(req.body);
//     const isAvailable = await ClientModel.findOne({
//       name: req.body.name,
//       isDeleted: false,
//     })
//       .lean()
//       .exec();

//     if (isAvailable)
//       throw new CustomError(
//         `The user you are trying to create is already registered.`
//       );

//     const {
//       name,
//       contactPerson,
//       contactPersonEmailAddress,
//       contactPersonPhoneNumber,
//       countryCode,
//       address,
//       documents,
//       prefix,
//     } = req.body;

//     let data = {
//       name,
//       contactPerson,
//       prefix: prefix.toUpperCase(),
//       contactPersonEmailAddress: contactPersonEmailAddress.toLowerCase(),
//       contactPersonPhoneNumber,
//       countryCode,
//       address,
//       documents,
//       subscriptionId: "kwrgfvwhkfkwhgcjhd",
//       created_at: getCurrentUnix(),
//       updated_at: getCurrentUnix(),
//       updated_by: req.session._id,
//       created_by: req.session._id,
//     };

//     const client = await ClientModel.create(data);

//     if (!client)
//       throw new CustomError(
//         `We are encountering some errors from our side. Please try again later.`
//       );

//     return res
//       .status(StatusCodes.OK)
//       .send(
//         responseGenerators({ ...client.toJSON() }, StatusCodes.OK, "SUCCESS", 0)
//       );
//   } catch (error) {
//     if (error instanceof ValidationError || error instanceof CustomError) {
//       return res
//         .status(StatusCodes.BAD_REQUEST)
//         .send(
//           responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
//         );
//     }
//     console.log(JSON.stringify(error));
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .send(
//         responseGenerators(
//           {},
//           StatusCodes.INTERNAL_SERVER_ERROR,
//           "Internal Server Error",
//           1
//         )
//       );
//   }
// };

// Update Client API
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

// API to provide client name for selection box with id
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






