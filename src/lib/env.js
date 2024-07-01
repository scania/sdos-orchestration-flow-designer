const { z } = require("zod");

const envSchema = z.object({
  OFD_AZURE_AD_CLIENT_ID: z.string().uuid().min(1),
  OFD_AZURE_AD_CLIENT_SECRET: z.string().min(1),
  OFD_AZURE_AD_TENANT_ID: z.string().uuid().min(1),
  STARDOG_USERNAME: z.string().min(1),
  STARDOG_PASSWORD: z.string().min(1),
  STARDOG_ENDPOINT: z.string().url().min(1),
  NEXTAUTH_URL: z.string().url().min(1),
  NEXTAUTH_SECRET: z.string().uuid().min(1),
  LOG_LEVEL: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
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
