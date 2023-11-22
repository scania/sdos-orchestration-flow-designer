import stardogConnection from "../connections/stardog";
import { query } from "stardog";
import jsonld, { JsonLdDocument } from "jsonld";

const DB_NAME_READ = "metaphactory";
const DB_NAME_WRITE = "ofg";

export interface ClassEntity {
  uri: string;
  className: string;
  parentClassUri: string;
  parentClassLabel?: string;
}

const fetchClassesQuery = `SELECT DISTINCT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
    ?class  rdf:type owl:Class; 
        rdfs:label ?labelProps;
        rdfs:subClassOf ?parentClass .
 }}`;

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
  return response.map((item: any) => ({
    uri: item.class.value,
    className: item.labelProps.value,
    parentClassUri: item.parentClass.value,
  }));
};

export const fetchRelations = async (className: string) => {
  const relationsQuery = `
  # get all relations possible from HTTPAction and their range (to)
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <https://kg.scania.com/it/iris_orchestration/>
  SELECT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
      ?s rdf:type owl:ObjectProperty; 
         rdfs:label ?label;
         rdfs:range ?range;
         rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :${className}. 
  }}
  `;

  return await executeQuery(DB_NAME_READ, relationsQuery);
};

export const fetchDynamicRelations = async () => {
  const dynamicRelationsQuery = `
  # get all relations possible from Action to Action
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <https://kg.scania.com/it/iris_orchestration/>
  SELECT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
      ?s rdf:type owl:ObjectProperty; 
         rdfs:label ?label;
         rdfs:range :Action;
         rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :Action. 
  }}
  `;

  return await executeQuery(DB_NAME_READ, dynamicRelationsQuery);
};

export const fetchOntologyRelations = async (className: string) => {
  const ontologyRelationsQuery = `
  # get all relations possible from HTTPAction
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <https://kg.scania.com/it/iris_orchestration/>
  SELECT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
      ?s rdf:type owl:ObjectProperty; 
         rdfs:label ?label;
         rdfs:range ?range.
      {?s rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :Action.}
      UNION { ?s rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :${className}.}
  }}
  `;

  return await executeQuery(DB_NAME_READ, ontologyRelationsQuery);
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
  graphData: JsonLdDocument
) => {
  const dropGraph = `DROP SILENT GRAPH <${graphName}>`;
  const graphDataNQuad = await convertJsonLdToNQuads(graphData);
  const saveGraph = `
  INSERT DATA {
    GRAPH <${graphName}> {
      ${graphDataNQuad}
    }
  }
`;

  await executeQuery(DB_NAME_WRITE, dropGraph);
  return await executeQuery(DB_NAME_WRITE, saveGraph);
};
