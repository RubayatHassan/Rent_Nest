import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT || "5000",
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL || "http://localhost:3000",
  server_url: process.env.SERVER_URL || `http://localhost:${process.env.PORT || "5000"}`,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || "10",
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  stripe_currency: process.env.STRIPE_CURRENCY || "bdt",
  sslcommerz_store_id: process.env.SSLCOMMERZ_STORE_ID,
  sslcommerz_store_password: process.env.SSLCOMMERZ_STORE_PASSWORD
};