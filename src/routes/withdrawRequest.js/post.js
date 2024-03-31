import { StatusCodes } from "http-status-codes";
import { getCurrentUnix } from "../../commons/common-functions";

import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import WithdrawRequestModel from "../../models/withdrawRequest";
import { createWithdrawRequestValidation, updateWithdrawRequestByAdminValidation, updateWithdrawRequestValidationByClient } from "../../helpers/validations/withdrawRequest.Validaton";


export const createWithdrawRequestHandler = async (req, res) => {
    try {
        // Validate the request body using Joi schema
        await createWithdrawRequestValidation.validateAsync(req.body);

        // Obtain clientId from session or query parameters
        const clientId = req.session.clientId || req.query.clientId;

        // Create Withdraw Request using the provided data
        const withdrawRequest = await WithdrawRequestModel.create({
            clientId,
            ...req.body,
            requestedDate: getCurrentUnix(),
            created_by: req.session.clientId,
            updated_by: req.session.clientId,
            created_at: getCurrentUnix(),
            updated_at: getCurrentUnix(),
        });

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                {
                    withdrawRequest,
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



export const updateWithdrawRequestByClientHandler = async (req, res) => {
    try {
        await updateWithdrawRequestValidationByClient.validateAsync(req.body);
        const { id } = req.params;
        const allowedFields = ["clientId", "requestedAmount", "status"];

        // Extracting the allowed fields based on payment method
        switch (req.body.paymentMethod) {
            case "UPI":
                allowedFields.push("upiId", "name");
                break;
            case "BANK":
                allowedFields.push("accountNumber", "ifscCode", "branchName", "accountHolderName", "paymentMethod");
                break;
            default:
                throw new CustomError("Invalid payment method");
        }

        // Filter the request body to include only allowed fields
        const updateFields = Object.keys(req.body)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        // Find the withdraw request by ID and status pending
        const withdrawRequest = await WithdrawRequestModel.findOneAndUpdate(
            { _id: id, status: "PENDING" },
            updateFields,
            { new: true }
        );

        if (!withdrawRequest) {
            throw new CustomError("Withdraw request not found or status is not pending");
        }

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                { withdrawRequest },
                StatusCodes.OK,
                "SUCCESS",
                0
            )
        );
    } catch (error) {
        if (error instanceof ValidationError || error instanceof CustomError) {
            return res.status(StatusCodes.BAD_REQUEST).send(
                responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
            );
        }
        console.log(JSON.stringify(error));
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
            responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", 1)
        );
    }
};




export const updateWithdrawRequestByAdminHandler = async (req, res) => {
    try {
        await updateWithdrawRequestByAdminValidation.validateAsync(req.body);
        const { id } = req.params;

        // Determine allowed fields based on the request body
        const allowedFields = [];
        if (req.body.status) allowedFields.push("status");
        if (req.body.transactionId) allowedFields.push("transactionId");
        if (req.body.note) allowedFields.push("note");

        // Find the withdraw request by ID
        let updateFields = {};
        if (req.body.status === "COMPLETED") {
            updateFields = {
                transactionId: req.body.transactionId,
                note: req.body.note,
                updated_at: getCurrentUnix()
            };
        } else {
            updateFields = {
                ...req.body,
                updated_at: getCurrentUnix()
            };
        }

        // Update the withdraw request with allowed fields
        const withdrawRequest = await WithdrawRequestModel.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );

        if (!withdrawRequest) {
            throw new CustomError("Withdraw request not found");
        }

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                { withdrawRequest },
                StatusCodes.OK,
                "SUCCESS",
                0
            )
        );
    } catch (error) {
        if (error instanceof ValidationError || error instanceof CustomError) {
            return res.status(StatusCodes.BAD_REQUEST).send(
                responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
            );
        }
        console.log(JSON.stringify(error));
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
            responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", 1)
        );
    }
};


export const deleteWithdrawRequestHandler = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the withdraw request by ID
        const withdrawRequest = await WithdrawRequestModel.findById(id);

        if (!withdrawRequest) {
            throw new CustomError("Withdraw request not found");
        }

        // Determine if the request is made by a client or an admin
        const isClient = req.session.clientId;
        const isAdmin = req.session.superAdmin;

        // Check if the client has access to delete the request
        if (isClient && withdrawRequest.clientId !== req.session.clientId) {
            throw new CustomError("Unauthorized to delete this withdraw request");
        }

        // Check if it's admin or client who owns the request, then delete
        if (isAdmin || (isClient && withdrawRequest.clientId === req.session.clientId)) {
            // Soft delete by setting isDeleted field to true
            await WithdrawRequestModel.findOneAndUpdate(
                { _id: id },
                { $set: { isDeleted: true } }
            );
            
            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Withdraw request deleted successfully"
            });
        } else {
            throw new CustomError("Unauthorized operation");
        }
    } catch (error) {
        if (error instanceof ValidationError || error instanceof CustomError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: error.message
            });
        }
        console.log(JSON.stringify(error));
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};



