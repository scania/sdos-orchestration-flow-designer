import { convertQuadsToJson, parseTTLFile } from "@/utils/shaclUtils";
import { createSHACLProcessor } from "@/utils/shaclProcessor";
import type { NextApiRequest, NextApiResponse } from "next";

const coreFields = [
  {
    name: "label",
    type: "text",
    label: "Label",
    validation: {
      required: true,
      minLength: 1,
      maxLength: 50,
      message: "Label must be a string with 1 to 50 characters",
    },
  },
];

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
    const className = (req.query.className as string) || "HTTPAction";

    const dynamicFormArray = await generateDynamicFormArray(className);

    res.status(200).json([...coreFields, ...dynamicFormArray]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing request" });
  }
}
