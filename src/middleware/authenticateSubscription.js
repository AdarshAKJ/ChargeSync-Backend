import { StatusCodes } from "http-status-codes";
import { ERROR } from "../commons/global-constants";
import { logsError, logsErrorAndUrl, responseGenerators } from "../lib/utils";
import { CustomError } from "../helpers/custome.error";
import Stripe from "stripe";
import configVariables from "../../config";
import path from "path";
import AdminUserModel from "../models/admin";

const stripe = new Stripe(configVariables.STRIPE_SECRET, {
  apiVersion: "2022-11-15",
});

/* we are checking the subscription for the user  */
export const authenticateSubscription = async (req, res, next) => {
  try {
    if (!req.tokenData)
      throw new CustomError("User data not present in token.");

    if (
      !req.tokenData.payment_status ||
      req.tokenData.payment_status != "ACTIVE"
    )
      throw new CustomError(
        "Please complete the subscription purchase process first."
      );
    if (!req.tokenData.subscription_id)
      throw new CustomError("Subscription is required.");

    const subscription = await stripe.subscriptions.retrieve(
      req.tokenData.subscription_id
    );
    if (!subscription) throw new CustomError("Subscription not found.");

    req.SD = subscription;
    if (subscription.status === "active") {
      if (subscription.status.toUpperCase() !== req.tokenData.plan_status)
        await AdminUserModel.findOneAndUpdate(
          { workspace_id: req.tokenData.workspace_id },
          { plan_status: "ACTIVE" }
        );
      console.log("Subscription is paid.");
      next();
    } else if (subscription.status === "trialing") {
      if (subscription.status.toUpperCase() !== req.tokenData.plan_status)
        await AdminUserModel.findOneAndUpdate(
          { workspace_id: req.tokenData.workspace_id },
          { plan_status: "TRIALING" }
        );
      console.log("Subscription is in trial.");
      next();
    } else if (subscription.status === "past_due") {
      if (subscription.status.toUpperCase() !== req.tokenData.plan_status)
        await AdminUserModel.findOneAndUpdate(
          { workspace_id: req.tokenData.workspace_id },
          { plan_status: "PAST_DUE" }
        );
      try {
        const invoiceData = await stripe.invoices.retrieve(
          subscription.latest_invoice
        );
        return res
          .status(StatusCodes.PERMANENT_REDIRECT)
          .send(
            responseGenerators(
              { paymentPage: invoiceData.hosted_invoice_url },
              StatusCodes.PERMANENT_REDIRECT,
              `Payment due is remaining.`,
              1
            )
          );
      } catch (error) {
        logsError(error, path.basename(__filename));
      }

      console.log("Subscription is due.");
      throw new CustomError(
        "Subscription is due, please renew your subscription."
      );
    } else {
      throw new CustomError(
        `We are encountering some issues, please try after sometime`
      );
    }
  } catch (error) {
    // JWT verification failed, return unauthorized response
    logsErrorAndUrl(res, error);
    if (error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
        );
    }
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
