export interface Quad {
  subject: string;
  predicate: string;
  object: string;
}

export interface PropertyWithDataType {
  property: string;
  dataType: string;
}

export interface SHACLPropertyShape {
  "http://www.w3.org/2000/01/rdf-schema#label": string;
  "http://www.w3.org/ns/shacl#datatype"?: string;
  "http://www.w3.org/ns/shacl#pattern"?: string;
  "http://www.w3.org/ns/shacl#minCount"?: string;
  "http://www.w3.org/ns/shacl#maxCount"?: string;
  "http://www.w3.org/ns/shacl#path"?: string;
  "http://www.w3.org/2000/01/rdf-schema#comment"?: string;
}

export enum FormFieldType {
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

export interface FormFieldValidation {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  message?: string;
}

export interface DynamicFormField {
  name: string;
  type: FormFieldType;
  label: string;
  validation?: FormFieldValidation;
  value?: any;
}

export interface ObjectProperties {
  shape: string;
  path: string;
  className: string;
  subClasses: string[];
  minCount: number;
  maxCount?: number;
}

export interface IClassConfig {
  "@id"?: string;
  "@type"?: string[];
  "iris:hasAction"?: {
    "@id": string;
  };
  "rdfs:label": string;
  "iris:constructSparql"?: string;
  "iris:endpoint"?: string;
  "iris:httpHeader"?: {
    "@value": string;
  };
}

export interface IFormInput {
  [key: string]: any;
}

export interface FormField {
  name: string;
  type: string;
  label: string;
  validation: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    required?: boolean;
  };
  value?: string;
}

export interface FormData {
  className: string;
  formFields: FormField[];
}

export interface DynamicFormProps {
  formData: FormData;
  onSubmit: (data: IFormInput) => void;
  onClose: () => void;
  excludeKeys: string[];
  label: string;
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface Parameter {
  label: string;
  keyValuePairs: KeyValuePair[];
}

export interface Task {
  label: string;
  subjectIri: string;
  parameters: Parameter[];
}

export interface TasksResponse {
  tasks: Task[];
}
