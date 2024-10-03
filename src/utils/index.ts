import { ContextDefinition } from "jsonld/jsonld";
import { Connection, Edge, MarkerType, Node } from "reactflow";
import { FormField, IClassConfig, ObjectProperties } from "./types";

// Constants for RDF, OWL, and RDFS namespaces
const RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const OWL_NS = "http://www.w3.org/2002/07/owl#";
const RDFS_NS = "http://www.w3.org/2000/01/rdf-schema#";
const IRIS_NS = "https://kg.scania.com/it/iris_orchestration/";

// Context for JSON-LD
const JSON_LD_CONTEXT: ContextDefinition = {
  rdf: RDF_NS,
  owl: OWL_NS,
  rdfs: RDFS_NS,
  iris: IRIS_NS,
};

// Interface for Class Configurations
export const generateClassId = () => `iris:${crypto.randomUUID()}`;

interface IState {
  nodes: Node[];
  edges: Edge[];
}

export interface GraphData {
  "@context": ContextDefinition;
  "@graph": IClassConfig[];
}

/**
 * Generates JSON-LD payload from graph state.
 * @param state - The state containing nodes and edges.
 * @returns The JSON-LD payload.
 */
//TODO: Write tests
export const generateJsonLdFromState = ({
  nodes,
  edges,
}: IState): GraphData => {
  const findNodeFormFields = (nodeId: string): FormData => {
    const node = nodes.find((node) => node.id === nodeId);
    return node ? node.data.formData : null;
  };

  const convertFromFieldsToNodeData = (formData: FormData) => {
    const obj: any = {};
    const { className, formFields } = formData;
    obj["@type"] = ["owl:NamedIndividual", `iris:${className}`];
    formFields.forEach((formField: FormField) => {
      obj[formField.name] = { "@value": formField.value };
    });
    return obj;
  };

  const constructNodeData = (nodeId: string, additionalData = {}) => {
    const formData = findNodeFormFields(nodeId);
    const nodeData = convertFromFieldsToNodeData(formData);

    if (!nodeData) return null;
    return { ...nodeData, ...additionalData, "@id": nodeId };
  };

  // Collect all unique node IDs from edges
  const uniqueNodeIds = new Set(
    edges.flatMap((edge) => [edge.source, edge.target])
  );

  // Map each unique node ID to its corresponding data
  const graphData: IClassConfig[] = Array.from(uniqueNodeIds)
    .map((nodeId) => {
      const additionalData =
        edges.find((edge) => edge.source === nodeId)?.data || {};
      return constructNodeData(nodeId, additionalData);
    })
    .filter((item): item is IClassConfig => item !== null);
  return {
    "@context": JSON_LD_CONTEXT,
    "@graph": graphData,
  };
};

export const getPaths = ({
  sourceNode,
  targetNode,
}: {
  sourceNode: Node | undefined;
  targetNode: Node | undefined;
}) => {
  const sourceFormData = sourceNode?.data.formData;
  const targetFormData = targetNode?.data.formData;
  const sourceObjectProperties: ObjectProperties[] =
    sourceFormData.objectProperties;
  const targetClass = `https://kg.scania.com/it/iris_orchestration/${targetFormData.className}`;
  //find targetClassName in source to get path
  const paths = sourceObjectProperties
    .filter(
      (obj) =>
        obj.subClasses.includes(targetClass) || obj.className === targetClass
    )
    .map((item) => item.path);
  return paths;
};

export const isValidConnection = (nodes: Node[]) => (conn: Connection) => {
  const sourceNode = nodes.find((node) => node.id === conn.source);
  const targetNode = nodes.find((node) => node.id === conn.target);
  const paths = getPaths({ sourceNode, targetNode });
  if (!paths.length) return false;
  return true;
};

export const setEdgeProperties = (
  defaultParams: Edge<any> | Connection,
  path: string
) => {
  //get source label
  const commonEdgeProps = {
    ...defaultParams,
    type: 'custom-edge'
  };
  const pathName = path;
  const pathNameLabel = pathName?.split("/").pop() || "";
  if (pathName) {
    return {
      ...commonEdgeProps,
      data: {
        [pathName]: {
          "@id": defaultParams.target,
        },
      },
      label: pathNameLabel,
    };
  }
  return {
    ...commonEdgeProps,
  };
};

export const initializeNodes = () => [
  {
    id: generateClassId(),
    type: "input",
    data: {
      label: "Task",
      formData: {
        className: "Task",
        objectProperties: [
          {
            shape: "https://kg.scania.com/it/iris_orchestration/hasActionShape",
            minCount: 1,
            path: "https://kg.scania.com/it/iris_orchestration/hasAction",
            className: "https://kg.scania.com/it/iris_orchestration/Action",
            subClasses: [
              "https://kg.scania.com/it/iris_orchestration/HTTPAction",
              "https://kg.scania.com/it/iris_orchestration/ResultAction",
              "https://kg.scania.com/it/iris_orchestration/SOAPAction",
              "https://kg.scania.com/it/iris_orchestration/ScriptAction",
              "https://kg.scania.com/it/iris_orchestration/SparqlConvertAction",
              "https://kg.scania.com/it/iris_orchestration/VirtualGraphAction",
            ],
          },
          {
            shape:
              "https://kg.scania.com/it/iris_orchestration/inputParameterShape_optional",
            minCount: 0,
            path: "https://kg.scania.com/it/iris_orchestration/inputParameter",
            className: "https://kg.scania.com/it/iris_orchestration/Parameter",
            subClasses: [
              "https://kg.scania.com/it/iris_orchestration/BasicCredentialsParameter",
              "https://kg.scania.com/it/iris_orchestration/HTTPParameter",
              "https://kg.scania.com/it/iris_orchestration/StandardParameter",
              "https://kg.scania.com/it/iris_orchestration/TokenCredentialsParameter",
            ],
          },
          {
            shape:
              "https://kg.scania.com/it/iris_orchestration/hasMetadataShape",
            path: "",
            className: "",
            subClasses: [],
          },
          {
            shape:
              "https://kg.scania.com/it/iris_orchestration/hasContextShape",
            minCount: 0,
            path: "https://kg.scania.com/it/iris_orchestration/hasContext",
            className:
              "https://kg.scania.com/it/iris_orchestration/JsonLdContext",
            subClasses: [],
            maxCount: 1,
          },
        ],
        formFields: [
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
        ],
      },
    },
    position: { x: 0, y: 0 },
    sourcePosition: "right",
  },
];
