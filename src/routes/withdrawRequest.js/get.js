import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import WithdrawRequestModel from "../../models/withdrawRequest";
import { setPagination } from "../../commons/common-functions";


// For clients // pagination mising
export const listWalletRequestsForClientHandler = async (req, res) => {
    try {
        const clientId = req?.session?.clientId || req?.query?.clientId;
        const pagination = setPagination(req.query);

        // Constructing the query to find wallet requests for the specific client
        let where = {
            isDeleted: false,
            clientId,
        };

        if (!req.query?.search) {
            const paginatedData = [];
            const totalCount = 0;
            const itemsPerPage = pagination.limit;

            return res.status(StatusCodes.OK).send(
                responseGenerators(
                    { paginatedData, totalCount, itemsPerPage },
                    StatusCodes.OK,
                    "SUCCESS",
                    0
                )
            );
        }

        where = {
            ...where,
            name: new RegExp(req.query?.search.toString(), "i"),
        };

        // Find wallet requests with pagination and search criteria
        const walletRequests = await WithdrawRequestModel.find(where)
            .sort(pagination.sort)
            .skip(pagination.offset)
            .limit(pagination.limit)
            .lean();

        // Count total documents for pagination
        const totalCount = await WithdrawRequestModel.countDocuments(where);

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                { paginatedData: walletRequests, totalCount, itemsPerPage: pagination.limit },
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


// For admins
export const listWalletRequestsForAdminHandler = async (req, res) => {
    try {
        const pagination = setPagination(req.query);

        // Find all wallet requests with pagination
        const walletRequests = await WithdrawRequestModel.find()
            .sort(pagination.sort)
            .skip(pagination.offset)
            .limit(pagination.limit)
            .lean();

        // Count total documents for pagination
        const totalCount = await WithdrawRequestModel.countDocuments();

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                { paginatedData: walletRequests, totalCount, itemsPerPage: pagination.limit },
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

