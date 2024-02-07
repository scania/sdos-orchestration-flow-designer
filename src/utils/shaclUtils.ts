const fs = require("fs");
import { Parser, Quad } from "n3";
import { Transform } from "stream";

// Function to parse TTL file
export const parseTTLFile = (filePath: string): Promise<Quad[]> => {
  return new Promise((resolve, reject) => {
    const parser = new Parser();
    const quads: Quad[] = [];

    const transform = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        try {
          const strChunk = chunk.toString();
          const parsedQuads = parser.parse(strChunk);
          parsedQuads.forEach((quad) => this.push(quad));
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },
    });

    fs.createReadStream(filePath)
      .pipe(transform)
      .on("data", (quad: Quad) => quads.push(quad))
      .on("error", (error: Error) => reject(error))
      .on("end", () => {
        resolve(quads);
      });
  });
};

export const convertQuadsToJson = (quads: Quad[]): any[] => {
  return quads.map((quad) => {
    return {
      subject: quad.subject.value,
      predicate: quad.predicate.value,
      object: quad.object.value,
      graph: quad.graph.value, // This may be empty for most quads
    };
  });
};

interface RdfQuad {
  subject: string;
  predicate: string;
  object: string;
}
//HTTPAction
export const getAllPropertiesWithDataTypesForRdf =
  (rdf: Array<{ subject: string; predicate: string; object: string }>) =>
  (className: string) => {
    // Find the shape URI for the given className
    const shapeUri = rdf.find(
      (quad) =>
        quad.predicate === "http://www.w3.org/ns/shacl#targetClass" &&
        quad.object.endsWith(className)
    )?.subject;

    if (!shapeUri) {
      return []; // Shape not found
    }

    // Get all properties for this shape
    const properties = rdf
      .filter(
        (quad) =>
          quad.subject === shapeUri &&
          quad.predicate === "http://www.w3.org/ns/shacl#property"
      )
      .map((quad) => quad.object);

    // Filter and map properties that have a defined datatype
    const propertiesWithDataTypes = properties
      .map((property) => {
        // Find the datatype quad for this property
        const dataTypeQuad = rdf.find(
          (q) =>
            q.subject === property &&
            q.predicate === "http://www.w3.org/ns/shacl#datatype"
        );
        return dataTypeQuad
          ? { property, dataType: dataTypeQuad.object }
          : null;
      })
      .filter((property) => property !== null);

    return propertiesWithDataTypes;
  };

export const getPropertyDetailsForShape =
  (rdf: Array<{ subject: string; predicate: string; object: string }>) =>
  (shapeUri: string) => {
    // Create object with shape properties
    const propertyDetails = rdf
      .filter((quad) => quad.subject === shapeUri)
      .reduce((details, quad) => {
        // Use predicate as key and object as value
        const key = quad.predicate.split("#").pop() || quad.predicate; // Extracting the last part after '#'
        details[key] = quad.object;
        return details;
      }, {});

    return propertyDetails;
  };

export const generatePropertiesObject = (
  rdf: Array<{ subject: string; predicate: string; object: string }>,
  className: string
) => {
  const allPropertiesWithDataTypes =
    getAllPropertiesWithDataTypesForRdf(rdf)(className);
  console.log(allPropertiesWithDataTypes, "allPropertiesWithDataTypes");

  const getPropertyDetails = getPropertyDetailsForShape(rdf);
  const allDataTypePropertiesForClass = allPropertiesWithDataTypes.map((item) =>
    getPropertyDetails(item?.property)
  );
  console.log(allDataTypePropertiesForClass, "allDataTypePropertiesForClass");

  return allDataTypePropertiesForClass;
};
