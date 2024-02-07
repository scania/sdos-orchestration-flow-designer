import { convertQuadsToJson, parseTTLFile } from "@/utils/shaclUtils";
import { createSHACLProcessor } from "@/utils/shaclProcessor";
import type { NextApiRequest, NextApiResponse } from "next";

async function generateDynamicFormArray(className: string) {
  const filePath = "ofg_shapes.ttl";
  const quads = await parseTTLFile(filePath);
  const jsonData = convertQuadsToJson(quads);
  const SHACLProcessor = createSHACLProcessor(jsonData);
  const shapeUri = SHACLProcessor.findShapeUriForClass(className);
  if (!shapeUri) {
    throw new Error(`Shape URI for class ${className} not found`);
  }
  const propertyDetailsForClass =
    SHACLProcessor.generatePropertyDetailsForClass(className);
  const convertToDynamicFormArray = SHACLProcessor.convertToDynamicFormArray(
    propertyDetailsForClass as any
  );

  return convertToDynamicFormArray;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const className = (req.query.className as string) || "HTTPAction"; // Default value or throw error if necessary

    const dynamicFormArray = await generateDynamicFormArray(className);

    res.status(200).json(dynamicFormArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing request" });
  }
}
