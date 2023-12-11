import { z } from "zod";

const envSchemaPublic = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().nonempty(),
});

export const publicEnv = envSchemaPublic.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
