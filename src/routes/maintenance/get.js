import { StatusCodes } from "http-status-codes";
import MaintenanceModel from "../../models/maintenance";
import { responseGenerators } from "../../lib/utils";

export const listmaintenanceHandler = async (req, res) => {
    // Extract pagination parameters from request query
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

    try {
        const skip = (page - 1) * limit;

        const maintenancelist = await MaintenanceModel.find({ isDeleted: false })
            .skip(skip)
            .limit(limit);

        return res.status(StatusCodes.OK).send(
            responseGenerators(
                {
                    maintenancelist,
                    currentPage: page,
                    totalPages: Math.ceil(maintenancelist.length / limit),
                    totalRecords: maintenancelist.length
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
