import { query, Connection } from "stardog";
import jsonld, { JsonLdDocument } from "jsonld";
import { GraphData } from "@/utils";
import { QueryFactory } from "@/queryFactory";
import { env } from "@/lib/env";

const DB_NAME_READ = "metaphactory";
const DB_NAME_WRITE = env.STARDOG_DB_NAME_WRITE;
const DB_NAME_RESULT_GRAPH = env.STARDOG_DB_RESULT_GRAPH;

export interface ClassEntity {
  uri: string;
  className: string;
  parentClassUri: string;
  category: string;
}

const fetchClassesQuery = `SELECT DISTINCT  ?parentClass ?parentLabel ?class ?labelProps ?category where { 
  graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
      VALUES ?parentClass { 
          <https://kg.scania.com/it/iris_orchestration/Action> 
          <https://kg.scania.com/it/iris_orchestration/Script> 
          <https://kg.scania.com/it/iris_orchestration/Parameter> 
      }
      ?class  rdf:type owl:Class; 
          rdfs:label ?labelProps;
          rdfs:subClassOf ?parentClass .
      ?parentClass rdfs:label ?parentLabel .
      FILTER NOT EXISTS {
          ?subclass rdfs:subClassOf ?class .
      }    
      BIND(localname(?parentClass) as ?category)
  }
} ORDER BY ?parentClass`;

// Convert JSON-LD to N-Quads
async function convertJsonLdToNQuads(jsonLdData: JsonLdDocument) {
  try {
    const nQuads = await jsonld.toRDF(jsonLdData, {
      format: "application/n-quads",
    });
    return nQuads;
  } catch (error) {
    console.error("Error converting JSON-LD to N-Quads:", error);
  }
}

export const getStardogInstance = ({
  token,
  endpoint,
  accept,
}: {
  token: string;
  endpoint?: string;
  accept?: any;
}) => {
  const executeQuery = async (dbName: string, testQuery: string) => {
    try {
      const conn = new Connection({
        username: "",
        endpoint: endpoint || env.STARDOG_ENDPOINT,
        token: token,
      });
      // Use the provided accept value or default to SPARQL JSON results.
      const results = await query.execute(
        conn,
        dbName,
        testQuery,
        accept || "application/sparql-results+json"
      );
      const { body, status } = results;
      if (!body && status === 200) {
        return;
      }
      // If the accept header is for JSON-LD, return the body directly.
      if (accept === "application/ld+json") {
        return body;
      }
      // Otherwise, return the bindings from a typical SPARQL SELECT query.
      return body.results.bindings;
    } catch (error) {
      console.error("Query execution failed:", error);
      throw error;
    }
  };

  const fetchClasses = async (): Promise<ClassEntity[]> => {
    const response = await executeQuery(DB_NAME_READ, fetchClassesQuery);
    return response.map((item: any) => ({
      uri: item.class.value,
      className: item.labelProps.value,
      parentClassUri: item.parentClass.value,
      category: item.category.value,
    }));
  };

  const updateGraph = async (
    graphName: string,
    graphData: GraphData | JsonLdDocument
  ) => {
    const graphDataNQuad = await convertJsonLdToNQuads(
      graphData as JsonLdDocument
    );
    const dropGraph = QueryFactory.dropGraph(graphName);
    await executeQuery(DB_NAME_WRITE, dropGraph);
    return await executeQuery(
      DB_NAME_WRITE,
      QueryFactory.insertData(graphName, graphDataNQuad!)
    );
  };

  const deleteGraph = async (graphName: string) => {
    const dropGraph = QueryFactory.dropGraph(graphName);
    return await executeQuery(DB_NAME_WRITE, dropGraph);
  };

  const fetchResultGraphStatus = async (resultGraphs: string[]) => {
    const fetchStatusQuery = QueryFactory.resultGraphStatusQuery(resultGraphs);
    return await executeQuery(DB_NAME_RESULT_GRAPH, fetchStatusQuery);
  };

  const fetchResultGraph = async (resultGraph: string) => {
    const resultGraphQuery = QueryFactory.resultGraphQuery(resultGraph);
    return await executeQuery(DB_NAME_RESULT_GRAPH, resultGraphQuery);
  };

  const deleteResultGraph = async (resultGraph: string) => {
    const deleteResultGraphQuery =
      QueryFactory.deleteResultGraphQuery(resultGraph);
    return await executeQuery(DB_NAME_RESULT_GRAPH, deleteResultGraphQuery);
  };
  return {
    fetchClasses,
    updateGraph,
    deleteGraph,
    fetchResultGraphStatus,
    fetchResultGraph,
    deleteResultGraph,
  };
};
