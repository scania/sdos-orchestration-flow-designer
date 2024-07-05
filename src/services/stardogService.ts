import stardogConnection from "../connections/stardog";
import { query, Connection, ConnectionOptions } from "stardog";
import jsonld, { JsonLdDocument } from "jsonld";
import { GraphData } from "@/utils";
import { QueryFactory } from "@/queryFactory";

const DB_NAME_READ = "vctofdpoc";
const DB_NAME_WRITE = "ofg";
const DB_NAME_VALIDATE = "validation";
const DB_SHACL_GRAPH = "http://scania.org/validate";

export interface ClassEntity {
  uri: string;
  className: string;
  parentClassUri: string;
  category: string;
}

const fetchClassesQuery = ` SELECT ?parentClass ?class  where {
      ?class  rdf:type owl:Class.
       OPTIONAL { ?class rdfs:subClassOf ?parentClass .}
      FILTER NOT EXISTS {
          ?subclass rdfs:subClassOf ?class .
      }    
} ORDER BY ?parentClass`;
const executeQuery = async (dbName: string, testQuery: string) => {
  try {
    const results = await query.execute(stardogConnection, dbName, testQuery);
    const { body, status } = results;
    if (!body && status === 200) {
      return;
    }
    return body.results.bindings;
  } catch (error) {
    console.error("Query execution failed:", error);
    throw error;
  }
};

export const fetchClasses = async (): Promise<ClassEntity[]> => {
  const response = await executeQuery(DB_NAME_READ, fetchClassesQuery);
  console.log(response);
  return response.map((item: any) => ({
    uri: item.class.value,
    className: item.class.value.split("/").pop(),
    parentClassUri: item.class.value,
    category: "Actions",
  }));
};

export const fetchRelations = async (className: string) => {
  return await executeQuery(
    DB_NAME_READ,
    QueryFactory.relationsQuery(className)
  );
};

export const fetchDynamicRelations = async () => {
  return await executeQuery(DB_NAME_READ, QueryFactory.dynamicRelationsQuery());
};

export const fetchOntologyRelations = async (className: string) => {
  return await executeQuery(
    DB_NAME_READ,
    QueryFactory.ontologyRelationsQuery(className)
  );
};

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

export const updateGraph = async (
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

export const deleteGraph = async (graphName: string) => {
  const dropGraph = QueryFactory.dropGraph(graphName);
  return await executeQuery(DB_NAME_WRITE, dropGraph);
};

export const fetchAllSHACLShapes = async () => {
  return await executeQuery(
    DB_NAME_VALIDATE,
    QueryFactory.fetchAllSHACLShapesQuery(DB_SHACL_GRAPH)
  );
};
