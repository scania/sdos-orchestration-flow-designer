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
  dbName: z.string().max(50),
  graphData: jsonSchema,
});

export type GraphBody = z.infer<typeof graphSave>;
