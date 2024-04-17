import { convertQuadsToJson, parseTTLFile } from "@/utils/shaclUtils";
import { createSHACLProcessor } from "@/utils/shaclProcessor";
import type { NextApiRequest, NextApiResponse } from "next";

const coreFields = [
  {
    name: "iris:label",
    type: "text",
    label: "Label",
    value: "",
    validation: {
      required: true,
      minLength: 1,
      maxLength: 50,
      message: "Label must be a string with 1 to 50 characters",
    },
  },
];

async function generateDynamicFormData(className: string) {
  const filePath = "ofg_shapes.ttl";
  const quads = await parseTTLFile(filePath);
  const jsonData = convertQuadsToJson(quads);
  const SHACLProcessor = createSHACLProcessor(jsonData);
  const shapeUri = SHACLProcessor.findShapeUriForClass(className);
  if (!shapeUri) {
    throw new Error(`Shape URI for class ${className} not found`);
  }
  const { generatePropertyDetailsForClass, convertToDynamicFormArray } =
    SHACLProcessor;
  const propertyDetailsForClass = generatePropertyDetailsForClass(className);
  const dynamicFormArray = convertToDynamicFormArray(
    propertyDetailsForClass as any
  );

  return { className: className, formFields: dynamicFormArray };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const className = (req.query.className as string) || "HTTPAction";

    const formData = await generateDynamicFormData(className);
    const allFields = [...coreFields, ...formData.formFields];

    res.status(200).json({ ...formData, formFields: allFields });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing request" });
  }
}
