interface Quad {
  subject: string;
  predicate: string;
  object: string;
}

interface PropertyWithDataType {
  property: string;
  dataType: string;
}

interface SHACLPropertyShape {
  "http://www.w3.org/2000/01/rdf-schema#label": string;
  "http://www.w3.org/ns/shacl#datatype"?: string;
  "http://www.w3.org/ns/shacl#pattern"?: string;
  "http://www.w3.org/ns/shacl#minCount"?: string;
  "http://www.w3.org/ns/shacl#maxCount"?: string;
  "http://www.w3.org/ns/shacl#path"?: string;
  "http://www.w3.org/2000/01/rdf-schema#comment"?: string;
}

enum FormFieldType {
  Text = "text",
  Number = "number",
  Email = "email",
  Date = "date",
  Radio = "radio",
  Select = "select",
  Textarea = "textarea",
  Checkbox = "checkbox",
  DateTimeLocal = "datetime-local",
  Time = "time",
  URL = "url",
  Unknown = "unknown",
}

interface FormFieldValidation {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  message?: string;
}

interface DynamicFormField {
  name: string;
  type: FormFieldType;
  label: string;
  validation?: FormFieldValidation;
  value?: any;
}

export const createSHACLProcessor = (rdf: Array<Quad>) => {
  const findShapeUriForClass = (className: string): string | undefined => {
    return rdf.find(
      (quad) =>
        quad.predicate === "http://www.w3.org/ns/shacl#targetClass" &&
        quad.object.endsWith(className)
    )?.subject;
  };

  const getAllProperties = (shapeUri: string): Array<string> => {
    return rdf
      .filter(
        (quad) =>
          quad.subject === shapeUri &&
          quad.predicate === "http://www.w3.org/ns/shacl#property"
      )
      .map((quad) => quad.object);
  };

  const getPropertiesWithDataTypes = (
    shapeUri: string
  ): PropertyWithDataType[] => {
    const allProperties = getAllProperties(shapeUri);
    return allProperties
      .map((propertyUri) => {
        const dataType = rdf.find(
          (q) =>
            q.subject === propertyUri &&
            q.predicate === "http://www.w3.org/ns/shacl#datatype"
        )?.object;
        return dataType ? { property: propertyUri, dataType } : null;
      })
      .filter((prop) => prop !== null) as PropertyWithDataType[];
  };

  const getPropertyDetails = (propertyUri: string): object => {
    return rdf
      .filter((quad) => quad.subject === propertyUri)
      .reduce((acc, quad) => {
        const key = quad.predicate;
        acc[key] = quad.object;
        return acc;
      }, {});
  };

  const generatePropertyDetailsForClass = (className: string): object[] => {
    const shapeUri = findShapeUriForClass(className);
    if (!shapeUri) return [];

    const propertiesWithDataTypes = getPropertiesWithDataTypes(shapeUri);
    return propertiesWithDataTypes.map((prop) =>
      getPropertyDetails(prop.property)
    );
  };

  const convertToDynamicFormArray = (
    shapes: SHACLPropertyShape[]
  ): DynamicFormField[] => {
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

      const field: DynamicFormField = {
        name: path || "",
        type: type,
        label: comment,
        value: "",
      };

      field.validation = {};

      if (minCount) {
        field.validation.min = minCount;
      }
      if (maxCount) {
        field.validation.max = maxCount;
      }

      if (pattern) {
        field.validation.pattern = pattern;
        field.validation.message = `${label} is invalid.`;
      }

      if (minCount > 0) {
        field.validation.required = true;
      }

      // Remove validation object if empty
      if (Object.keys(field.validation).length === 0) {
        delete field.validation;
      }

      return field;
    });
  };

  return {
    findShapeUriForClass,
    getAllProperties,
    getPropertiesWithDataTypes,
    getPropertyDetails,
    generatePropertyDetailsForClass,
    convertToDynamicFormArray,
  };
};
