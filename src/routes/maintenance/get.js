import { StatusCodes } from "http-status-codes";
import MaintenanceModel from "../../models/maintenance";
import { responseGenerators } from "../../lib/utils";
import { setPagination } from "../../commons/common-functions";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";

export const listmaintenanceHandler = async (req, res) => {

    try {
        const pagination = setPagination(req.query);

        const maintenancelist = await MaintenanceModel.find({ isDeleted: false })
            .sort(pagination.sort)
            .skip(pagination.offset)
            .limit(pagination.limit);

        const totalCount = await MaintenanceModel.countDocuments({ isDeleted: false });

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                {
                    maintenancelist,
                    paginatedData: pagination.page, 
                    totalCount: Math.ceil(totalCount / pagination.limit),
                    itemsPerPage: maintenancelist.length
                },
                StatusCodes.OK,
                "Maintenance records fetched successfully",
                0
            )
        );
    } catch (error) {
        if (error instanceof ValidationError || error instanceof CustomError) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .send(responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1));
        }
        console.log(JSON.stringify(error));
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", 1));
      }
};
