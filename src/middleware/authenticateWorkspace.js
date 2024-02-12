import { StatusCodes } from "http-status-codes";
import { ERROR } from "../commons/global-constants";
import { logsErrorAndUrl, responseGenerators } from "../lib/utils";
import TeamUserModel from "../models/clientUser";

/* we are checking workspace is belongs to the user or not  */
export const authenticateWorkspace = async (req, res, next) => {
  try {
    let providedWorkspaceId;
    if (req.query.workspace_id) {
      providedWorkspaceId = req.query.workspace_id;
    } else if (req.body.workspace_id) {
      providedWorkspaceId = req.body.workspace_id;
    } else if (req.params.workspace_id) {
      providedWorkspaceId = req.params.workspace_id;
    }
    let userData = req.tokenData;
    if (!userData) throw new Error("User data not present in token.");
    let user = await TeamUserModel.findOne({
      _id: userData._id,
      workspace_id: providedWorkspaceId,
    });
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(
          responseGenerators(
            {},
            StatusCodes.UNAUTHORIZED,
            `Workspace not authorized.`,
            1
          )
        );
    }
    req.workspace_id = providedWorkspaceId;
    // User token and user are valid, continue to the next middleware
    next();
  } catch (error) {
    // JWT verification failed, return unauthorized response
    logsErrorAndUrl(req, error);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send(
        responseGenerators(
          {},
          StatusCodes.UNAUTHORIZED,
          ERROR.PROVIDE_TOKEN_ERROR,
          1
        )
      );
  }
};
