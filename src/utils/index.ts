import { ContextDefinition } from "jsonld/jsonld";
import { Connection, Edge, MarkerType, Node } from "reactflow";
import { FormField, IClassConfig } from "./types";

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
