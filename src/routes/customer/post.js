import { ValidationError } from "webpack";
import {
  createCustomerValidation,
  getChargerSelectValidation,
  getCustomerSelectValidation,
  getStationSelectValidation,
  listCustomerValidation,
  signupOrLoginOTPVerificationValidation,
  singleCustomerValidation,
  updateCustomerValidation,
} from "../../helpers/validations/customer.validation";
import { responseGenerators } from "../../lib/utils";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import CustomerModel from "../../models/customer";
import WalletModel from "../../models/wallet";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import {
  comparePassword,
  encryptData,
  generateSecret,
  generateTOTP,
  getCurrentUnix,
  hashPassword,
  setPagination,
  verifyTotp,
} from "../../commons/common-functions";
import { getJwt } from "../../helpers/Jwt.helper";
import { CUSTOMER_MESSAGE, OTP } from "../../commons/global-constants";
import ChargerModel from "../../models/charger";
import ChargingStationModel from "../../models/chargingStations";

// create user and provide OTP, if exist then provide OTP
export const createCustomerHandler = async (req, res) => {
  try {
    await createCustomerValidation.validateAsync(req.body);

    if (req.body.loginBy == "EMAIL") {
      if (!req.body.password)
        throw new CustomError(`Please provide valid password.`);

      let customerData;

      customerData = await CustomerModel.findOne({
        email: req.body.email.toLowerCase(),
        clientId: req.body.clientId,
        isDeleted: false,
      });

      if (!customerData || (customerData && !customerData.isVerified)) {
        if (customerData && !customerData.isVerified) {
          await CustomerModel.deleteOne({
            _id: customerData._id,
          });
        }

        //create customer
        customerData = await CustomerModel.create({
          ...req.body,
          email: req.body.email.toLowerCase(),
          password: await hashPassword(req.body.password),
          created_by: req.body._id,
          updated_by: req.body._id,
          created_at: getCurrentUnix(),
          updated_at: getCurrentUnix(),
        });

        // generate otp
        const secret = generateSecret();
        const purpose = "SIGNUP-LOGIN";
        const { code, newOtpSecret } = generateTOTP(secret, purpose);
        customerData.otpSecret.push(newOtpSecret);
        await customerData.save();
        console.log(
          `SIGNUP OR LOGIN EMAIL:- ` + req.body.email + ` OTP :- ` + code
        );

        //send otp  TO DO
        return res.status(StatusCodes.OK).send(
          responseGenerators(
            {
              token: null,
              customerData: null,
              loginCompleted: false,
              email: customerData.email,
            },
            StatusCodes.OK,
            OTP.SUCCESS,
            0
          )
        );
      } else {
        // password compare
        let passwordMatch = await comparePassword(
          req.body.password,
          customerData.password
        );

        if (!passwordMatch)
          throw new CustomError(
            `No account found with given Email address and password.`
          );

        customerData.lastLogin = getCurrentUnix();
        customerData.updated_at = getCurrentUnix();

        let customerTokenData = customerData.toJSON();

        // token generate
        let jswToken = await getJwt({
          id: customerData._id,
          clientId: customerData?.clientId,
          email: customerData.email,
          role: "CUSTOMER",
        });

        delete customerTokenData?.password;
        delete customerTokenData?.otpSecret;

        return res.status(StatusCodes.OK).send(
          responseGenerators(
            {
              token: encryptData(jswToken),
              customerData: customerTokenData,
              loginCompleted: true,
            },
            StatusCodes.OK,
            CUSTOMER_MESSAGE.LOGIN_SUCCESS,
            0
          )
        );
      }
    } else if (req.body.loginBy == "PHONE") {
      let customerData = await CustomerModel.findOne({
        phoneNumber: req.body.phoneNumber,
        countryCode: req.body.countryCode,
        clientId: req.body.clientId,
        isDeleted: false,
      });

      if (!customerData) {
        customerData = await CustomerModel.create({
          ...req.body,
          created_by: req.body._id,
          updated_by: req.body._id,
          created_at: getCurrentUnix(),
          updated_at: getCurrentUnix(),
        });
      }

      const secret = generateSecret();
      const purpose = "SIGNUP-LOGIN";
      const { code, newOtpSecret } = generateTOTP(secret, purpose);
      customerData.otpSecret.push(newOtpSecret);
      customerData.isVerified = true;
      await customerData.save();
      // check wallet
      let isWalletAvailable = await WalletModel.findOne({
        customerId: customerData._id,
      });

      if (!isWalletAvailable) {
        await WalletModel.create({
          clientId: req.body.clientId,
          customerId: customerData._id,
          amount: 0,
          created_by: req.body._id,
          updated_by: req.body._id,
          created_at: getCurrentUnix(),
          updated_at: getCurrentUnix(),
        });
      }

      console.log(
        `SIGNUP OR LOGIN PHONE:- ` + req.body.phoneNumber + ` OTP :- ` + code
      );

      //send otp  TO DO
      return res.status(StatusCodes.OK).send(
        responseGenerators(
          {
            token: null,
            customerData: null,
            loginCompleted: false,
            phoneNumber: customerData.phoneNumber,
            countryCode: customerData.countryCode,
          },
          StatusCodes.OK,
          OTP.SUCCESS,
          0
        )
      );
    } else {
      throw new CustomError("Please provide a valid login type");
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

// customer OTP verification
export const signupOrLoginOTPVerificationHandler = async (req, res) => {
  try {
    await signupOrLoginOTPVerificationValidation.validateAsync(req.body);

    // if email  exits
    if (req.body.email) {
      let customerData = await CustomerModel.findOne({ email: req.body.email });
      if (!customerData) throw new CustomError("Couldn't find customer");
      const purpose = "SIGNUP-LOGIN";
      let otpSecret = customerData.otpSecret.filter(
        (e) => e.purpose == purpose
      );

      if (!otpSecret || !otpSecret.length)
        throw new CustomError("No pending OTP found for customer.");
      let isValid = verifyTotp(otpSecret.reverse()[0].secret, req.body.otp);
      // let isValid = true;
      if (isValid) {
        await CustomerModel.findOneAndUpdate(
          { _id: customerData._id },
          {
            otpSecret: [],
            isVerified: true,
          }
        );

        customerData.lastLogin = getCurrentUnix();
        customerData.updated_at = getCurrentUnix();

        let customerTokenData = customerData.toJSON();

        // token generate
        let jswToken = await getJwt({
          id: customerData._id,
          clientId: customerData?.clientId,
          email: customerData.email,
          role: "CUSTOMER",
        });

        delete customerTokenData?.password;
        delete customerTokenData?.otpSecret;

        return res.status(StatusCodes.OK).send(
          responseGenerators(
            {
              token: encryptData(jswToken),
              customerData: customerTokenData,
              loginCompleted: true,
            },
            StatusCodes.OK,
            CUSTOMER_MESSAGE.LOGIN_SUCCESS,
            0
          )
        );
        // welcome email.
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(
            responseGenerators(
              null,
              StatusCodes.BAD_REQUEST,
              OTP.INVALID_OTP,
              true
            )
          );
      }
    } else {
      // if phone exits
      let customerData = await CustomerModel.findOne({
        phoneNumber: req.body.phoneNumber,
        countryCode: req.body.countryCode,
      });
      if (!customerData) throw new CustomError("Couldn't find customer");
      const purpose = "SIGNUP-LOGIN";
      let otpSecret = customerData.otpSecret.filter(
        (e) => e.purpose == purpose
      );

      if (!otpSecret || !otpSecret.length)
        throw new CustomError("No pending OTP found for customer.");
      let isValid = verifyTotp(otpSecret.reverse()[0].secret, req.body.otp);

      if (isValid) {
        await CustomerModel.findOneAndUpdate(
          { _id: customerData._id },
          {
            $pull: { otpSecret: { purpose } },
            isVerified: true,
          }
        );

        customerData.lastLogin = getCurrentUnix();
        customerData.updated_at = getCurrentUnix();

        let customerTokenData = customerData.toJSON();

        // token generate
        let jswToken = await getJwt({
          id: customerData._id,
          clientId: customerData?.clientId,
          phoneNumber: customerData.phoneNumber,
          countryCode: customerData.countryCode,
          role: "CUSTOMER",
        });

        delete customerTokenData?.password;
        delete customerTokenData?.otpSecret;
        return res.status(StatusCodes.OK).send(
          responseGenerators(
            {
              token: encryptData(jswToken),
              customerData: customerTokenData,
              loginCompleted: true,
            },
            StatusCodes.OK,
            CUSTOMER_MESSAGE.LOGIN_SUCCESS,
            0
          )
        );
        // welcome email.
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(
            responseGenerators(
              null,
              StatusCodes.BAD_REQUEST,
              OTP.INVALID_OTP,
              true
            )
          );
      }
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

// update the customer
export const updateCustomerHandler = async (req, res) => {
  try {
    // validation
    await updateCustomerValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    // not need to check  clientId

    // check for verification
    if (!req.session?.isVerified)
      throw new CustomError(`Please verify your account`);

    // find customer and update customer
    let customerData = await CustomerModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          isDeleted: false,
          updated_at: getCurrentUnix(),
          updated_by: req.session._id,
          ...req.body,
        },
      },
      { new: true }
    );

    // delete password
    if (customerData.password) delete customerData.password;
    customerData.save();

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(customerData.toJSON(), StatusCodes.OK, "SUCCESS", 0)
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

// list customer
export const listCustomerHandler = async (req, res) => {
  try {
    await listCustomerValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    };
    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { fname: new RegExp(req.query.search.toString(), "i") },
            { lname: new RegExp(req.query.search.toString(), "i") },
            { phoneNumber: new RegExp(req.query.search.toString(), "i") },
            { email: new RegExp(req.query.search.toString(), "i") },
          ],
        },
      };
    }

    const pagination = setPagination(req.query);

    const customers = await CustomerModel.find(where)
      .select("-password")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    if (!customers) throw new CustomError(`No Customer found.`);
    let total_count = await CustomerModel.count(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: customers,
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

// single customer
export const singleCustomerHandler = async (req, res) => {
  try {
    await singleCustomerValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      _id: req.params.id,
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    const aggregationPipeline = [
      {
        $match: where,
      },
      {
        $lookup: {
          from: "wallets",
          localField: "_id",
          foreignField: "customerId",
          as: "walletData",
        },
      },
    ];

    const customer = await CustomerModel.aggregate(aggregationPipeline); // password

    if (customer.length) throw new CustomError("Customer not found");
    delete customer[0]?.password;

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          singleCustomerData: customer[0],
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

//
// get-customer-select
export const getCustomerSelectHandler = async (req, res) => {
  try {
    await getCustomerSelectValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      clientId: req?.session?.clientId || req?.body?.clientId,
    };

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { fname: new RegExp(req.query.search.toString(), "i") },
            { lname: new RegExp(req.query.search.toString(), "i") },
            { phoneNumber: new RegExp(req.query.search.toString(), "i") },
            { email: new RegExp(req.query.search.toString(), "i") },
          ],
        },
      };
    }

    const pagination = setPagination(req.query);

    const customer = await CustomerModel.find(where)
      .select("_id fname lname")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          selectedCustomer: customer,
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

// get-charger-select
export const getChargerSelectHandler = async (req, res) => {
  try {
    await getChargerSelectValidation.validateAsync(req.body);

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req?.session?.clientId || req?.body?.clientId,
    };

    if (req.query?.search) {
      where = {
        ...where,
        name: new RegExp(req.query?.search.toString(), "i"),
      };
    }

    const pagination = setPagination(req.query);

    const charger = await ChargerModel.find(where)
      .select("serialNumber name")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          selectedCharger: charger,
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

// get-station-select
export const getStationSelectHandler = async (req, res) => {
  try {
    await getStationSelectValidation.validateAsync(req.body);

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    if (req.query?.search) {
      where = {
        ...where,
        station_name: new RegExp(req.query?.search.toString(), "i"),
      };
    }

    const pagination = setPagination(req.query);

    const station = await ChargingStationModel.find(where)
      .select("_id station_name")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    if (!station) throw new CustomError("Station not found");

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          selectedStation: station,
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
