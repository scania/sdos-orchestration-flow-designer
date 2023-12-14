import { ContextDefinition, JsonLdDocument } from "jsonld/jsonld";
import { Connection, Edge, MarkerType, Node } from "reactflow";

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

export const generateClassId = () => `iris:${crypto.randomUUID()}`;

// Class type configuration
export const CLASS_CONFIG: Record<string, IClassConfig> = {
  Task: {
    "@type": ["owl:NamedIndividual", "iris:Task"],
    "rdfs:label": "GetPizzasAndAllergenes",
  },
  "HTTP Action": {
    "@type": ["owl:NamedIndividual", "iris:HTTPAction"],
    "rdfs:label": "fetchAllPizzas",
    "iris:endpoint": "http://example.com/pizzas",
    "iris:httpHeader": { "@value": '{"Accept": "application/json"}' },
  },
  "Sparql Convert Action": {
    "rdfs:label": "sparqlConvertActionLabel",
    "iris:constructSparql": "",
  },
};

interface IState {
  nodes: Node[];
  edges: Edge[];
}

export interface GraphData {
  "@context": ContextDefinition;
  "@graph": IClassConfig[];
}

const toCamelCase = (str: string): string => {
  return str
    .split(" ")
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
};

/**
 * Assigns class data based on the given type.
 * @param type - The type of class to assign data for.
 * @returns The class data for the given type.
 */
export const assignClassData = (type: string): IClassConfig | {} =>
  CLASS_CONFIG[type] || { "rdfs:label": `${toCamelCase(type)}Label` };

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
  const findNodeData = (nodeId: string) => {
    const node = nodes.find((node) => node.id === nodeId);
    return node ? node.data.classData : null;
  };

  const constructNodeData = (nodeId: string, additionalData = {}) => {
    const nodeData = findNodeData(nodeId);
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

export const setEdgeProperties = (
  nodes: Node[],
  defaultParams: Edge<any> | Connection
) => {
  //get source label
  const commonEdgeProps = {
    ...defaultParams,
    markerEnd: { type: MarkerType.Arrow },
  };
  const sourceNodeLabel = nodes.find((node) => node.id === defaultParams.source)
    ?.data.label;
  if (sourceNodeLabel === "Task") {
    return {
      ...commonEdgeProps,
      data: {
        "iris:hasAction": {
          "@id": defaultParams.target,
        },
      },
      label: "hasAction",
    };
  }
  return {
    ...commonEdgeProps,
    data: {
      "iris:hasNextAction": {
        "@id": defaultParams.target,
      },
    },
    label: "hasNextAction",
  };
};
