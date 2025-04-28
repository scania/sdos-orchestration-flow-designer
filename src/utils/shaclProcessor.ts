// Import necessary types
import {
  ClassFormField,
  FormFieldType,
  ObjectProperties,
  PropertyWithDataType,
  SHACLPropertyShape,
} from "./types";

// Define the Quad type
type Quad = {
  subject: string;
  predicate: string;
  object: string;
};

export const createSHACLProcessor = (rdf: Quad[]) => {
  if (!rdf || !Array.isArray(rdf)) {
    throw new Error("Invalid RDF data provided. Expected an array of quads.");
  }

  const subjectIndex = new Map<string, Quad[]>();
  const predicateIndex = new Map<string, Quad[]>();
  const objectIndex = new Map<string, Quad[]>();
  const subjectPredicateIndex = new Map<string, Map<string, Quad[]>>();

  rdf.forEach((quad: Quad) => {
    if (!subjectIndex.has(quad.subject)) {
      subjectIndex.set(quad.subject, []);
    }
    subjectIndex.get(quad.subject)!.push(quad);

    if (!predicateIndex.has(quad.predicate)) {
      predicateIndex.set(quad.predicate, []);
    }
    predicateIndex.get(quad.predicate)!.push(quad);

    if (!objectIndex.has(quad.object)) {
      objectIndex.set(quad.object, []);
    }
    objectIndex.get(quad.object)!.push(quad);

    if (!subjectPredicateIndex.has(quad.subject)) {
      subjectPredicateIndex.set(quad.subject, new Map<string, Quad[]>());
    }
    const predicateMap = subjectPredicateIndex.get(quad.subject)!;
    if (!predicateMap.has(quad.predicate)) {
      predicateMap.set(quad.predicate, []);
    }
    predicateMap.get(quad.predicate)!.push(quad);
  });

  const findShapeUriForClass = (className: string): string | undefined => {
    const quads =
      predicateIndex.get("http://www.w3.org/ns/shacl#targetClass") || [];
    const result = quads.find((quad) =>
      quad.object.endsWith(className)
    )?.subject;
    return result;
  };

  const getSubclassOf = (className: string): string => {
    const quads =
      predicateIndex.get("http://www.w3.org/2000/01/rdf-schema#subClassOf") ||
      [];
    const subClassOfQuads = quads.filter((q) => q.subject.endsWith(className));
    if (!subClassOfQuads.length) {
      return "undefined";
    }
    return subClassOfQuads[0].object;
  };

  const getAllProperties = (shapeUri: string): Array<string> => {
    const predicateMap = subjectPredicateIndex.get(shapeUri);
    if (!predicateMap) return [];
    const quads = predicateMap.get("http://www.w3.org/ns/shacl#property") || [];
    return quads.map((quad) => quad.object);
  };

  const getObjectProperties = (shapeUri: string): string[] => {
    const allProperties = getAllProperties(shapeUri);
    return allProperties.filter((propertyUri) => {
      const predicateMap = subjectPredicateIndex.get(propertyUri);
      if (
        predicateMap &&
        predicateMap.has("http://www.w3.org/ns/shacl#datatype")
      ) {
        return false;
      }
      return true;
    });
  };

  const getSubClassesOf = (classUri: string): string[] => {
    const quads =
      predicateIndex.get("http://www.w3.org/2000/01/rdf-schema#subClassOf") ||
      [];
    const subClasses = quads.filter((q) => q.object === classUri);
    const subClassNames = subClasses.map((subClass) => subClass.subject);
    return subClassNames;
  };

  const getObjectPropertyDetail = (shapeUri: string): ObjectProperties => {
    const obj: ObjectProperties = {
      shape: shapeUri,
      path: "",
      className: "",
      subClasses: [],
      minCount: 0,
      maxCount: undefined,
    };
    const quads = subjectIndex.get(shapeUri) || [];
    quads.forEach((q) => {
      if (q.predicate === "http://www.w3.org/ns/shacl#path") {
        obj.path = q.object;
      }
      if (q.predicate === "http://www.w3.org/ns/shacl#class") {
        obj.className = q.object;
        const subClasses = getSubClassesOf(q.object);
        obj.subClasses = subClasses;
      }
      if (q.predicate === "http://www.w3.org/ns/shacl#minCount") {
        obj.minCount = parseInt(q.object);
      }
      if (q.predicate === "http://www.w3.org/ns/shacl#maxCount") {
        obj.maxCount = parseInt(q.object);
      }
    });
    return obj;
  };

  const getObjectPropertyDetails = (shapeUri: string): ObjectProperties[] => {
    const objectProperties = getObjectProperties(shapeUri);
    return objectProperties.map((objUri) => getObjectPropertyDetail(objUri));
  };

  const getPropertiesWithDataTypes = (
    shapeUri: string
  ): PropertyWithDataType[] => {
    const allProperties = getAllProperties(shapeUri);
    return allProperties
      .map((propertyUri) => {
        const predicateMap = subjectPredicateIndex.get(propertyUri);
        const dataType = predicateMap?.get(
          "http://www.w3.org/ns/shacl#datatype"
        )?.[0]?.object;
        return dataType ? { property: propertyUri, dataType } : null;
      })
      .filter((prop): prop is PropertyWithDataType => prop !== null);
  };

  const getPropertyDetails = (propertyUri: string): SHACLPropertyShape => {
    const quads = subjectIndex.get(propertyUri) || [];
    return quads.reduce((acc: SHACLPropertyShape, quad) => {
      const key = quad.predicate;
      acc[key] = quad.object;
      return acc;
    }, {} as SHACLPropertyShape);
  };

  const generatePropertyDetailsForClass = (
    className: string
  ): SHACLPropertyShape[] => {
    const shapeUri = findShapeUriForClass(className);
    if (!shapeUri) return [];

    const propertiesWithDataTypes = getPropertiesWithDataTypes(shapeUri);
    return propertiesWithDataTypes.map((prop) =>
      getPropertyDetails(prop.property)
    );
  };

  const convertToClassFormArray = (
    shapes: SHACLPropertyShape[]
  ): ClassFormField[] => {
    return shapes.map((shape) => {
      const label = shape["http://www.w3.org/2000/01/rdf-schema#label"];
      const pattern = shape["http://www.w3.org/ns/shacl#pattern"];
      const comment =
        shape["http://www.w3.org/2000/01/rdf-schema#comment"] || "";
      const minCount = parseInt(
        shape["http://www.w3.org/ns/shacl#minCount"] || "0"
      );
      const maxCount = parseInt(
        shape["http://www.w3.org/ns/shacl#maxCount"] || "0"
      );
      const xsdDataType = shape["http://www.w3.org/ns/shacl#datatype"];
      const path = shape["http://www.w3.org/ns/shacl#path"];
      let type: FormFieldType;
      const schemaContext = "http://www.w3.org/2001/XMLSchema#";
      switch (xsdDataType) {
        case `${schemaContext}string`:
          type = FormFieldType.Text;
          break;
        case `${schemaContext}integer`:
        case `${schemaContext}int`:
        case `${schemaContext}decimal`:
        case `${schemaContext}float`:
        case `${schemaContext}double`:
          type = FormFieldType.Number;
          break;
        case `${schemaContext}boolean`:
          type = FormFieldType.Checkbox;
          break;
        case `${schemaContext}date`:
          type = FormFieldType.Date;
          break;
        case `${schemaContext}dateTime`:
          type = FormFieldType.DateTimeLocal;
          break;
        case `${schemaContext}time`:
          type = FormFieldType.Time;
          break;
        case `${schemaContext}email`:
          type = FormFieldType.Email;
          break;
        case `${schemaContext}url`:
          type = FormFieldType.URL;
          break;
        default:
          type = FormFieldType.Unknown;
          break;
      }

      const field: ClassFormField = {
        name: path || "",
        type: type,
        label: comment,
        value: "",
        validation: {},
      };

      if (minCount) {
        field.validation!.min = minCount;
      }
      if (maxCount) {
        field.validation!.max = maxCount;
      }

      if (pattern) {
        field.validation!.pattern = pattern;
      }

      if (minCount > 0) {
        field.validation!.required = true;
      }

      // Remove validation object if empty
      if (Object.keys(field.validation!).length === 0) {
        delete field.validation;
      }

      return field;
    });
  };

  return {
    findShapeUriForClass,
    getAllProperties,
    getObjectPropertyDetails,
    getPropertiesWithDataTypes,
    getPropertyDetails,
    generatePropertyDetailsForClass,
    getSubclassOf,
    convertToClassFormArray,
  };
};
