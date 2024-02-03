import Stripe from "stripe";
import configVariables from "../../config";

export const stripe = new Stripe(
    configVariables.STRIPE_SECRET,
    {
      apiVersion: "2022-11-15",
    }
  );