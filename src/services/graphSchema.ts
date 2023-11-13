import { z } from "zod";

export const GraphSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  nodes: z.array(z.string()),
});
