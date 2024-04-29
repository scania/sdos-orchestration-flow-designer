import { convertQuadsToJson, parseTTLFile } from "@/utils/shaclUtils";
import { createSHACLProcessor } from "@/utils/shaclProcessor";
import type { NextApiRequest, NextApiResponse } from "next";

const coreFields = [
  {
    name: "https://kg.scania.com/it/iris_orchestration/label",
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
  const filePath1 = "ofg_shapes.ttl";
  const filePath2 = "orchestration_ontology.ttl";
  const quads1 = await parseTTLFile(filePath1);
  const quads2 = await parseTTLFile(filePath2);
  const combinedQuads = quads1.concat(quads2);
  const jsonData = convertQuadsToJson(combinedQuads);
  const SHACLProcessor = createSHACLProcessor(jsonData);
  const shapeUri = SHACLProcessor.findShapeUriForClass(className);
  if (!shapeUri) {
    throw new Error(`Shape URI for class ${className} not found`);
  }
  const { generatePropertyDetailsForClass, convertToDynamicFormArray } =
    SHACLProcessor;
  const propertyDetailsForClass = generatePropertyDetailsForClass(className);
  const formFields = convertToDynamicFormArray(propertyDetailsForClass as any);
  const subClassOf = SHACLProcessor.getSubclassOf(className);
  const objectProperties = SHACLProcessor.getObjectPropertyDetails(shapeUri);
  return {
    className,
    subClassOf,
    objectProperties,
    formFields,
  };
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
    res.status(500).json({ error: error.message });
  }
}
