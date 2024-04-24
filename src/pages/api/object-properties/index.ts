import { convertQuadsToJson, parseTTLFile } from "@/utils/shaclUtils";
import { createSHACLProcessor } from "@/utils/shaclProcessor";
import type { NextApiRequest, NextApiResponse } from "next";

async function generateObjectProperties(className: string) {
  const filePath = "ofg_shapes.ttl";
  const quads = await parseTTLFile(filePath);
  const jsonData = convertQuadsToJson(quads);
  const SHACLProcessor = createSHACLProcessor(jsonData);
  const shapeUri = SHACLProcessor.findShapeUriForClass(className);
  if (!shapeUri) {
    throw new Error(`Shape URI for class ${className} not found`);
  }
  const objectProperties = SHACLProcessor.getObjectPropertyDetails(shapeUri);
  return objectProperties;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const className = (req.query.className as string) || "HTTPAction";
    res.status(200).json(await generateObjectProperties(className));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
