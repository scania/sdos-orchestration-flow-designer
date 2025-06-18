import { ContextDefinition } from "jsonld/jsonld";
import { Connection, Edge, Node } from "reactflow";
import { FormField, IClassConfig, ObjectProperties } from "./types";

const RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const OWL_NS = "http://www.w3.org/2002/07/owl#";
const RDFS_NS = "http://www.w3.org/2000/01/rdf-schema#";
const IRIS_NS = "https://kg.scania.com/it/iris_orchestration/";
const CORE_NS = "http://kg.scania.com/core/";

const JSON_LD_CONTEXT: ContextDefinition = {
  rdf: RDF_NS,
  owl: OWL_NS,
  rdfs: RDFS_NS,
  iris: IRIS_NS,
  core: CORE_NS,
};

export const generateClassId = () => `iris:${crypto.randomUUID()}`;

interface IState {
  nodes: Node[];
  edges: Edge[];
  metadata: { email: string };
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
export const generateJsonLdFromState = ({
  nodes,
  edges,
  metadata,
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

  // Array to hold extra nodes (e.g., ResultMetaData nodes)
  const extraNodes: any[] = [];

  const constructNodeData = (nodeId: string) => {
    const formData = findNodeFormFields(nodeId);
    if (!formData) return null;

    const nodeData = convertFromFieldsToNodeData(formData);

    if (formData.className === "Task") {
      const resultMetaDataNodeId = generateClassId();

      const resultMetaDataNode = {
        "@id": resultMetaDataNodeId,
        "@type": ["owl:NamedIndividual", "iris:ResultMetaData"],
        "rdfs:label": { "@value": "Result Metadata" },
        "iris:description": {
          "@value":
            "This instance details will be used as Metadata in resultgraph which will be used for NamedGraph security. This description details will be copied to all the ResultGraph",
        },
        "iris:title": { "@value": "" },
        "core:contributor": { "@value": metadata.email },
        "core:graphType": { "@value": "private" },
        "core:informationResponsible": {
          "@value": metadata.email,
        },
      };

      extraNodes.push(resultMetaDataNode);

      nodeData["iris:hasResultMetaData"] = {
        "@id": resultMetaDataNodeId,
      };
    }

    const outgoingEdges = edges.filter((edge) => edge.source === nodeId);

    outgoingEdges.forEach((edge) => {
      const edgeData = edge.data;
      if (edgeData) {
        for (const [key, value] of Object.entries(edgeData)) {
          if (nodeData[key]) {
            // If the property already exists, we need to handle multiple values
            if (Array.isArray(nodeData[key])) {
              nodeData[key].push(value);
            } else {
              nodeData[key] = [nodeData[key], value];
            }
          } else {
            nodeData[key] = value;
          }
        }
      }
    });

    return { ...nodeData, "@id": nodeId };
  };

  const graphData: IClassConfig[] = nodes
    .map((node) => {
      return constructNodeData(node.id);
    })
    .filter((item): item is IClassConfig => item !== null);

  graphData.push(...extraNodes);
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

  if (!sourceFormData || !targetFormData) return [];

  const sourceObjectProperties: ObjectProperties[] =
    sourceFormData.objectProperties;
  const targetClassFullURI = `${IRIS_NS}${targetFormData.className}`;

  const paths = sourceObjectProperties
    .filter((obj) => {
      const classMatches = obj.className === targetClassFullURI;
      const subclassMatches = obj.subClasses.includes(targetClassFullURI);
      return classMatches || subclassMatches;
    })
    .map((item) => item.path);

  return paths;
};

export const isValidConnection = (nodes: Node[]) => (conn: Connection) => {
  const sourceNode = nodes.find((node) => node.id === conn.source);
  const targetNode = nodes.find((node) => node.id === conn.target);
  // Prevent self-connection
  if (sourceNode === targetNode) {
    return;
  }
  const paths = getPaths({ sourceNode, targetNode });
  return paths.length > 0;
};

export const setEdgeProperties = (
  defaultParams: Edge<any> | Connection,
  path: string
) => {
  const commonEdgeProps = {
    ...defaultParams,
    type: "custom-edge",
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
  return commonEdgeProps;
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
              "https://kg.scania.com/it/iris_orchestration/KafkaAction",
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
            name: "http://www.w3.org/2000/01/rdf-schema#label",
            type: "text",
            label: "Label",
            value: "Task",
            validation: {
              required: true,
              minLength: 1,
              maxLength: 50,
              message: "Label must be a string with 1 to 50 characters",
            },
          },
          {
            name: "https://kg.scania.com/it/iris_orchestration/database",
            type: "text",
            label: "Task database for ResultAction if connector is defined.",
            value: "",
            validation: {
              max: 1,
            },
          },
          {
            name: "https://kg.scania.com/it/iris_orchestration/namedgraph",
            type: "text",
            label: "Task namedgraph for ResultAction if connector is defined.",
            value: "",
            validation: {
              max: 1,
            },
          },
        ],
      },
    },
    position: { x: 0, y: 0 },
    sourcePosition: "right",
  },
];
