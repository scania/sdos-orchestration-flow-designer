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

  const constructNodeData = (nodeId: string) => {
    const formData = findNodeFormFields(nodeId);
    if (!formData) return null;

    const nodeData = convertFromFieldsToNodeData(formData);

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

export const initializeNodes = (label: string, formData: any) => [
  {
    id: generateClassId(),
    type: "input",
    data: {
      label: label,
      formData: formData,
    },
    position: { x: 0, y: 0 },
    sourcePosition: "right",
  },
];
