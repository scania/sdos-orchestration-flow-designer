const { z } = require("zod");

const envSchema = z.object({
  OFD_AZURE_AD_CLIENT_ID: z.string().uuid().optional(),
  OFD_AZURE_AD_CLIENT_SECRET: z.string().optional(),
  OFD_AZURE_AD_TENANT_ID: z.string().uuid().optional(),
  STARDOG_USERNAME: z.string().optional(),
  STARDOG_PASSWORD: z.string().optional(),
  STARDOG_ENDPOINT: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().uuid().optional(),
  LOG_LEVEL: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

const env = envSchema.parse(process.env);

module.exports = {
  env,
  envSchema,
};
