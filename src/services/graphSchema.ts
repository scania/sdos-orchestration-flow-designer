import { z } from "zod";

const jsonSchema: z.ZodType<any, z.ZodTypeDef, any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(jsonSchema),
  ])
);

export const graphSave = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  graphName: z.string(),
  description: z.string().optional(),
  isDraft: z.boolean(),
  isPrivate: z.boolean(),
});

export type GraphBody = z.infer<typeof graphSave>;
