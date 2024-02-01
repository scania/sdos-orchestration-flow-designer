import {
  convertQuadsToJson,
  parseTTLFile,
  getAllPropertiesWithDataTypesForRdf,
  getPropertyDetailsForShape,
  generatePropertiesObject,
} from "@/utils/shaclUtils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const filePath = "ofg_shapes.ttl";
    const quads = await parseTTLFile(filePath);
    const jsonData = convertQuadsToJson(quads);
    const getAllPropertiesWithDataTypes =
      getAllPropertiesWithDataTypesForRdf(jsonData);
    // const props = getAllPropertiesWithDataTypes("ResultAction");
    // console.log(props);

    const properties = generatePropertiesObject(
      jsonData,
      "SparqlConvertAction"
    );
    console.log(properties, "endpointprops");

    //kg.scania.com/it/iris_orchestration/endpointShape

    https: res.status(200).json(jsonData);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Error parsing TTL file" });
  }
}
