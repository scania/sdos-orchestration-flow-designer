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
  const ofg_shapes = "ofg_shapes.ttl";
  const orchestration_ontology = "orchestration_ontology.ttl";
  const core_shapes = "core_shapes.ttl"
  const quads_ofg = await parseTTLFile(ofg_shapes);
  const quads_oo = await parseTTLFile(orchestration_ontology);
  const quads_core = await parseTTLFile(core_shapes)
  const combinedQuads = quads_ofg.concat(quads_oo).concat(quads_core);
  const jsonData = convertQuadsToJson(combinedQuads);
  const SHACLProcessor = createSHACLProcessor(jsonData);
  const shapeUri = SHACLProcessor.findShapeUriForClass(className);
  //console.log("className : ", className);
  //console.log("shapeUri : ", shapeUri);

  if (!shapeUri) {
    throw new Error(`Shape URI for class ${className} not found`);
  }
  const { getAllSuperClassesOf, findShapeUrisForClasses, generatePropertyDetailsForClass, 
    convertToClassFormArray, getSuperClassOf, getObjectPropertyDetails
   } =
    SHACLProcessor;
  
  const allSuperClasses = getAllSuperClassesOf(className);
  const allSuperShapes = findShapeUrisForClasses(allSuperClasses);
  //console.log("allSuperClasses : ", allSuperClasses)
  //console.log("allSuperShapes", allSuperShapes);

  const propertyDetailsForAllSuperClasses = allSuperShapes.map((shape) =>
    generatePropertyDetailsForClass(shape)
  ).flat();
  const propertyDetailsForClass = generatePropertyDetailsForClass(shapeUri);
  const allPropertyDetails = [
    ...propertyDetailsForClass,
    ...propertyDetailsForAllSuperClasses,
  ];

  //const formFields = convertToClassFormArray(propertyDetailsForClass as any);
  const formFields = convertToClassFormArray(allPropertyDetails as any);
  const subClassOf = getSuperClassOf(className);
  const objectProperties = getObjectPropertyDetails(shapeUri);
  //console.log("formFields : ", formFields);
  //console.log("objectProperties : ", objectProperties);
  
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
