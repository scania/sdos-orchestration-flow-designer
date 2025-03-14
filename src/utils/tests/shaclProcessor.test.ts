import { SHACLPropertyShape, DynamicFormField, FormFieldType } from "../types";
import { createSHACLProcessor } from "../shaclProcessor";
import { parseTTLFile, convertQuadsToJson } from "../shaclUtils";

describe("createSHACLProcessor", () => {
  let rdfData: any;
  let processor: ReturnType<typeof createSHACLProcessor>;

  beforeAll(async () => {
    const filePath1 = "ofg_shapes.ttl";
    const filePath2 = "orchestration_ontology.ttl";
    const quads1 = await parseTTLFile(filePath1);
    const quads2 = await parseTTLFile(filePath2);
    rdfData = quads1.concat(quads2);
    const jsonData = convertQuadsToJson(rdfData);
    processor = createSHACLProcessor(jsonData);
  });

  describe("findShapeUriForClass", () => {
    test("returns correct shape URI for valid class", () => {
      const result = processor.findShapeUriForClass("HTTPAction");
      expect(result).toBe(
        "https://kg.scania.com/it/iris_orchestration/HTTPActionShape"
      );
    });

    test("returns undefined for non-existent class", () => {
      const result = processor.findShapeUriForClass("UnknownClass");
      expect(result).toBeUndefined();
    });
  });

  describe("getAllProperties", () => {
    test("returns properties for valid shape", () => {
      const result = processor.getAllProperties(
        "https://kg.scania.com/it/iris_orchestration/HTTPActionShape"
      );
      expect(result).toEqual(
        expect.arrayContaining([
          "https://kg.scania.com/it/iris_orchestration/endpointShape",
        ])
      );
    });

    test("returns empty array for shape without properties", () => {
      const result = processor.getAllProperties(":EmptyShape");
      expect(result).toEqual([]);
    });
  });

  describe("getObjectPropertyDetails", () => {
    test("returns object properties for shape", () => {
      const result = processor.getObjectPropertyDetails(
        "https://kg.scania.com/it/iris_orchestration/HTTPActionShape"
      );
      expect(result).toEqual(
        expect.arrayContaining([
          {
            className: "https://kg.scania.com/it/iris_orchestration/Action",
            minCount: 1,
            path: "https://kg.scania.com/it/iris_orchestration/hasNextAction",
            shape:
              "https://kg.scania.com/it/iris_orchestration/hasNextActionShape",
            subClasses: [
              "https://kg.scania.com/it/iris_orchestration/HTTPAction",
              "https://kg.scania.com/it/iris_orchestration/ResultAction",
              "https://kg.scania.com/it/iris_orchestration/SOAPAction",
              "https://kg.scania.com/it/iris_orchestration/ScriptAction",
              "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
              "https://kg.scania.com/it/iris_orchestration/VirtualGraphAction",
            ],
          },
        ])
      );
    });

    test("returns empty array when no object properties", () => {
      const result = processor.getObjectPropertyDetails(
        ":ShapeWithNoObjectProperties"
      );
      expect(result).toEqual([]);
    });
  });

  describe("getPropertiesWithDataTypes", () => {
    test("returns data properties for shape", () => {
      const result = processor.getPropertiesWithDataTypes(
        "https://kg.scania.com/it/iris_orchestration/HTTPActionShape"
      );
      expect(result).toEqual(
        expect.arrayContaining([
          {
            dataType: "http://www.w3.org/2001/XMLSchema#string",
            property:
              "https://kg.scania.com/it/iris_orchestration/httpHeaderShape",
          },
        ])
      );
    });

    test("returns empty array when no data properties", () => {
      const result = processor.getPropertiesWithDataTypes(
        ":ShapeWithNoDataProperties"
      );
      expect(result).toEqual([]);
    });
  });

  describe("getPropertyDetails", () => {
    test("returns details for property", () => {
      const result = processor.getPropertyDetails(
        "https://kg.scania.com/it/iris_orchestration/endpointShape"
      );
      expect(result).toEqual({
        "http://www.w3.org/2000/01/rdf-schema#label": "Endpoint",
        "http://kg.scania.com/core/timestamp": "2023-04-14T08:43:00",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type":
          "http://www.w3.org/ns/shacl#PropertyShape",
        "http://www.w3.org/2000/01/rdf-schema#comment":
          "endpoint should be string and start with '/'",
        "http://www.w3.org/2000/01/rdf-schema#label": "endpoint Shape",
        "http://www.w3.org/ns/shacl#datatype":
          "http://www.w3.org/2001/XMLSchema#string",
        "http://www.w3.org/ns/shacl#path": ":endpoint",
        "http://www.w3.org/ns/shacl#maxCount": "1",
        "http://www.w3.org/ns/shacl#minCount": "1",
        "http://www.w3.org/ns/shacl#path":
          "https://kg.scania.com/it/iris_orchestration/endpoint",
        "http://www.w3.org/ns/shacl#pattern": "^/",
      });
    });

    test("returns empty object for unknown property", () => {
      const result = processor.getPropertyDetails(":unknownProperty");
      expect(result).toEqual({});
    });
  });

  describe("generatePropertyDetailsForClass", () => {
    test("returns properties for class", () => {
      const result = processor.generatePropertyDetailsForClass("HTTPAction");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual({
        "http://kg.scania.com/core/timestamp": "2023-04-14T08:43:00",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type":
          "http://www.w3.org/ns/shacl#PropertyShape",
        "http://www.w3.org/2000/01/rdf-schema#comment":
          "HTTP Header should be a string",
        "http://www.w3.org/2000/01/rdf-schema#label": "httpHeader Shape",
        "http://www.w3.org/ns/shacl#datatype":
          "http://www.w3.org/2001/XMLSchema#string",
        "http://www.w3.org/ns/shacl#maxCount": "1",
        "http://www.w3.org/ns/shacl#path":
          "https://kg.scania.com/it/iris_orchestration/httpHeader",
      });
    });

    test("returns empty array for class without shape", () => {
      const result = processor.generatePropertyDetailsForClass("UnknownClass");
      expect(result).toEqual([]);
    });
  });

  describe("getSubclassOf", () => {
    test("returns superclass of class", () => {
      const result = processor.getSubclassOf("HTTPAction");
      expect(result).toBe("https://kg.scania.com/it/iris_orchestration/Action");
    });

    test('returns "undefined" when no superclass', () => {
      const result = processor.getSubclassOf("StandaloneClass");
      expect(result).toBe("undefined");
    });
  });

  describe("convertToDynamicFormArray", () => {
    test("correctly maps shapes to form fields", () => {
      const shapes: SHACLPropertyShape[] = [
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "Username",
          "http://www.w3.org/2000/01/rdf-schema#comment": "Enter your username",
          "http://www.w3.org/ns/shacl#path": ":username",
          "http://www.w3.org/ns/shacl#datatype":
            "http://www.w3.org/2001/XMLSchema#string",
          "http://www.w3.org/ns/shacl#minCount": "1",
        },
      ];
      const result = processor.convertToDynamicFormArray(shapes);
      expect(result).toEqual([
        {
          name: ":username",
          type: FormFieldType.Text,
          label: "Enter your username",
          value: "",
          validation: { min: 1, required: true },
        },
      ]);
    });

    test("handles unknown data types", () => {
      const shapes: SHACLPropertyShape[] = [
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "testLabel",
          "http://www.w3.org/ns/shacl#path": ":customData",
          "http://www.w3.org/ns/shacl#datatype":
            "http://example.org/CustomDataType",
        },
      ];
      const result = processor.convertToDynamicFormArray(shapes);
      expect(result[0].type).toBe(FormFieldType.Unknown);
    });

    test("omits validation object if empty", () => {
      const shapes: SHACLPropertyShape[] = [
        {
          "http://www.w3.org/2000/01/rdf-schema#label": "testLabel",
          "http://www.w3.org/ns/shacl#path": ":age",
          "http://www.w3.org/ns/shacl#datatype":
            "http://www.w3.org/2001/XMLSchema#integer",
        },
      ];
      const result = processor.convertToDynamicFormArray(shapes);
      expect(result[0]).not.toHaveProperty("validation");
    });
  });

  describe("Error Handling", () => {
    test("createSHACLProcessor throws error when rdf is undefined", () => {
      expect(() => {
        createSHACLProcessor(undefined as any);
      }).toThrow("Invalid RDF data provided. Expected an array of quads.");
    });

    test("findShapeUriForClass throws error when rdf is undefined", () => {
      expect(() => {
        createSHACLProcessor(undefined as any).findShapeUriForClass(
          "ClassName"
        );
      }).toThrow("Invalid RDF data provided. Expected an array of quads.");
    });
  });
});
