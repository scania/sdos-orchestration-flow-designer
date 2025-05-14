import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { convertQuadsToJson, parseTTLFile } from "@/utils/shaclUtils";
import { createSHACLProcessor } from "@/utils/shaclProcessor";

const coreField = {
  name: "http://www.w3.org/2000/01/rdf-schema#label",
  type: "text",
  label: "Label",
  value: "",
  validation: {
    required: true,
    minLength: 1,
    maxLength: 50,
    message: "Label must be a string with 1 to 50 characters",
  },
};

async function generateClassFormData(className: string) {
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
  const { generatePropertyDetailsForClass, convertToClassFormArray } =
    SHACLProcessor;
  const propertyDetailsForClass = generatePropertyDetailsForClass(className);
  const formFields = convertToClassFormArray(propertyDetailsForClass as any);
  const subClassOf = SHACLProcessor.getSubclassOf(className);
  const objectProperties = SHACLProcessor.getObjectPropertyDetails(shapeUri);
  return {
    className,
    subClassOf,
    objectProperties,
    formFields,
  };
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    const className = (req.query.className as string) || "HTTPAction";
    const formData = await generateClassFormData(className);
    const allFields = [
      { ...coreField, value: className },
      ...formData.formFields,
    ];
    res.status(200).json({ ...formData, formFields: allFields });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export default withAuth({})(handler);
