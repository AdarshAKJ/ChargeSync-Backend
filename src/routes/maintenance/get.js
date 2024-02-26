import { StatusCodes } from "http-status-codes";
import MaintenanceModel from "../../models/maintenance"
import { responseGenerators } from "../../lib/utils";

export const listmaintenanceHandler = async (req, res)=>{
    const maintenancelist = await MaintenanceModel.find({isDeleted:false})

    return res.status(StatusCodes.OK).send(
        responseGenerators(
          {maintenancelist},
          StatusCodes.OK,
          "Maintenance record updated successfully",
          0
        )
      );
}
