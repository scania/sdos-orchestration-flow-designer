require("dotenv").config({ path: "./.env.local" });
const process = require("process");
const { envSchema } = require("./src/lib/env");
const validateEnv = () => {
  try {
    envSchema.parse(process.env);
    console.log("Environment variables validated successfully.");
  } catch (error) {
    console.error("Environment variable validation failed:", error);
    process.exit(1);
  }
};
validateEnv();
