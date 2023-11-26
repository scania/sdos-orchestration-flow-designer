import { JsonLd } from "jsonld/jsonld-spec";

// Constants for RDF, OWL, and RDFS namespaces
const RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const OWL_NS = "http://www.w3.org/2002/07/owl#";
const RDFS_NS = "http://www.w3.org/2000/01/rdf-schema#";
const IRIS_NS = "https://kg.scania.com/it/iris_orchestration/";

// Context for JSON-LD
const JSON_LD_CONTEXT: jsonld.ContextDefinition = {
  rdf: RDF_NS,
  owl: OWL_NS,
  rdfs: RDFS_NS,
  iris: IRIS_NS,
};

// Interface for Class Configurations
interface IClassConfig {
  "@id": string;
  "@type": string[];
  "iris:hasAction"?: {
    "@id": string;
  };
  "rdfs:label"?: string;
  "iris:endpoint"?: string;
  "iris:httpHeader"?: {
    "@value": string;
  };
}

// Class type configuration
const CLASS_CONFIG: Record<string, IClassConfig> = {
  Task: {
    "@id": "iris:aeca5978_21af_4c8d_af8f_f2e68e2a3417",
    "@type": ["owl:NamedIndividual", "iris:Task"],
    "iris:hasAction": { "@id": "iris:301acd01_19b5_4f19_ab76_ee13ffb57c00" },
    "rdfs:label": "GetPizzasAndAllergenes",
  },
  "HTTP Action": {
    "@id": "iris:301acd01_19b5_4f19_ab76_ee13ffb57c00",
    "@type": ["owl:NamedIndividual", "iris:HTTPAction"],
    "iris:endpoint": "http://example.com/pizzas",
    "iris:httpHeader": { "@value": '{"Accept": "application/json"}' },
  },
};

interface INode {
  id: string;
  data: {
    classData?: IClassConfig;
  };
}

interface IEdge {
  source: string;
  target: string;
}

interface IState {
  nodes: INode[];
  edges: IEdge[];
}

interface GraphData {
  "@context": any;
  "@graph": IClassConfig[];
}

/**
 * Assigns class data based on the given type.
 * @param type - The type of class to assign data for.
 * @returns The class data for the given type.
 */
export const assignClassData = (type: string): IClassConfig | {} =>
  CLASS_CONFIG[type] || {};

/**
 * Generates JSON-LD payload from graph state.
 * @param state - The state containing nodes and edges.
 * @returns The JSON-LD payload.
 */
export const generateJsonLdFromState = ({
  nodes,
  edges,
}: IState): GraphData => {
  const graphData: IClassConfig[] = edges
    .flatMap(({ source, target }) => {
      const sourceData =
        nodes.find((node) => node.id === source)?.data?.classData ?? null;
      const targetData =
        nodes.find((node) => node.id === target)?.data?.classData ?? null;
      return [sourceData, targetData];
    })
    .filter((item): item is IClassConfig => item !== null);

  return {
    "@context": JSON_LD_CONTEXT,
    "@graph": graphData,
  };
};
