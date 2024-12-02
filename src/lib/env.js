const { z } = require("zod");

const envSchema = z.object({
  OFD_AZURE_AD_CLIENT_ID: z.string().uuid().min(1),
  OFD_AZURE_AD_CLIENT_SECRET: z.string().min(1),
  OFD_AZURE_AD_TENANT_ID: z.string().uuid().min(1),
  SDOS_CLIENT_ID: z.string().uuid().min(1),
  SDOS_ENDPOINT: z.string().url().min(1),
  STARDOG_CLIENT_ID: z.string().uuid().min(1),
  STARDOG_ENDPOINT: z.string().url().min(1),
  STARDOG_DB_NAME_WRITE: z.string().min(1),
  NEXTAUTH_URL: z.string().url().min(1),
  NEXTAUTH_SECRET: z.string().uuid().min(1),
  DATABASE_URL: z.string().url().min(1),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  TEST_BASE_URL: z.string().url().optional(),
  ADMIN_EMAILS: z.string().optional(),
});

//This will make all env vars optional
const buildEnvSchema = envSchema.partial();
let env;

//making all vars optional during build and as per envSchema during start
if (process.env.npm_lifecycle_event === "build") {
  env = buildEnvSchema.parse(process.env);
} else {
  env = envSchema.parse(process.env);
}

module.exports = {
  env,
  envSchema,
};
