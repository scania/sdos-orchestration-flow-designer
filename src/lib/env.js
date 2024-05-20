const { z } = require("zod");

const envSchema = z.object({
  OFD_AZURE_AD_CLIENT_ID: z.string().uuid().nonempty(),
  OFD_AZURE_AD_CLIENT_SECRET: z.string().nonempty(),
  OFD_AZURE_AD_TENANT_ID: z.string().uuid().nonempty(),
  STARDOG_USERNAME: z.string().nonempty(),
  STARDOG_PASSWORD: z.string().nonempty(),
  STARDOG_ENDPOINT: z.string().url().nonempty(),
  NEXTAUTH_URL: z.string().url().nonempty(),
  NEXTAUTH_SECRET: z.string().uuid().nonempty(),
  LOG_LEVEL: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  TEST_USERNAME: z.string().optional(),
  TEST_PASSWORD: z.string().optional(),
});

const env = envSchema.parse(process.env);

module.exports = {
  env,
  envSchema,
};
