import { z } from "zod";

const envSchema = z.object({
  OFD_AZURE_AD_CLIENT_ID: z.string().uuid().nonempty(),
  OFD_AZURE_AD_CLIENT_SECRET: z.string().nonempty(),
  OFD_AZURE_AD_TENANT_ID: z.string().uuid().nonempty(),
  STARDOG_USERNAME: z.string().nonempty(),
  STARDOG_PASSWORD: z.string().nonempty(),
  STARDOG_ENDPOINT: z.string().url().nonempty(),
  NEXTAUTH_URL: z.string().url().nonempty(),
});

export const env = envSchema.parse(process.env);
