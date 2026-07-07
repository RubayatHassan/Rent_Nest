import Stripe from "stripe";
import config from "../config";

if (!config.stripe_secret_key) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe payments will fail until it is configured.");
}

export const stripe = new Stripe(config.stripe_secret_key || "sk_test_missing");