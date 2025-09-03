import { query, Connection, db } from "stardog";
import jsonld, { JsonLdDocument } from "jsonld";
import { GraphData } from "@/utils";
import { QueryFactory } from "@/queryFactory";
import { env } from "@/lib/env";

const DB_NAME_READ = "metaphactory";
const DB_NAME_WRITE = env.STARDOG_DB_NAME_WRITE;

export interface ClassEntity {
  uri: string;
  className: string;
  parentClassUri: string;
  category: string;
}
const databaseExists = async (
  dbName: string,
  endpoint?: string,
  token?: string
) => {
  const conn = new Connection({
    username: "",
    endpoint: endpoint || env.STARDOG_ENDPOINT,
    token: token!,
  });
  const res = await db.get(conn, dbName);
  return res?.status === 200;
};

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
  acceptHeader,
}: {
  token: string;
  endpoint?: string;
  acceptHeader?: any;
}) => {
  const executeQuery = async (dbName: string, finalQuery: string) => {
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
        finalQuery,
        acceptHeader || "application/sparql-results+json"
      );
      const { body, status } = results;
      if (!body && status === 200) {
        return;
      }
      // If the accept header is for JSON-LD, return the body directly.
      if (acceptHeader === "application/ld+json") {
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

  const fetchResultGraph = async (resultGraph: string, db: string) => {
    const resultGraphQuery = QueryFactory.resultGraphQuery(resultGraph);
    return await executeQuery(db, resultGraphQuery);
  };

  const deleteResultGraph = async (resultGraph: string, db: string) => {
    const exists = await databaseExists(db, endpoint, token);
    if (!exists) {
      const err = new Error(`Stardog database "${db}" not found`);
      (err as any).code = "DB_NOT_FOUND";
      throw err;
    }
    const deleteResultGraphQuery =
      QueryFactory.deleteResultGraphQuery(resultGraph);
    return await executeQuery(db, deleteResultGraphQuery);
  };
  return {
    fetchClasses,
    updateGraph,
    deleteGraph,
    fetchResultGraph,
    deleteResultGraph,
  };
};
