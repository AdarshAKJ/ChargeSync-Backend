import { StatusCodes } from "http-status-codes";
import MaintenanceModel from "../../models/maintenance";
import { responseGenerators } from "../../lib/utils";
import { setPagination } from "../../commons/common-functions";

export const listmaintenanceHandler = async (req, res) => {

    try {
      const pagination = setPagination(req.query);

        const maintenancelist = await MaintenanceModel.find({ isDeleted: false })
            .sort(pagination.sort)
            .skip(pagination.offset)
            .limit(pagination.limit);

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                {
                    maintenancelist,
                    paginatedData: page,
                    totalCount: Math.ceil(maintenancelist.length / limit),
                    itemsPerPage: maintenancelist.length
                },
                StatusCodes.OK,
                "Maintenance records fetched successfully",
                0
            )
        );
    } catch (error) {
        console.error("Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
            responseGenerators(
                {},
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                1
            )
        );
    }
};
