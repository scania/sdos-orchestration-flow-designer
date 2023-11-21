import stardogConnection from "../connections/stardog";
import { query } from "stardog";

const DB_NAME = "metaphactory";

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

const executeQuery = async (testQuery: string) => {
  try {
    const { body } = await query.execute(stardogConnection, DB_NAME, testQuery);
    return body.results.bindings;
  } catch (error) {
    console.error("Query execution failed:", error);
    throw error;
  }
};

export const fetchClasses = async (): Promise<ClassEntity[]> => {
  const response = await executeQuery(fetchClassesQuery);
  return response.map((item: any) => ({
    uri: item.class.value,
    className: item.labelProps.value,
    parentClassUri: item.parentClass.value,
  }));
};

export const fetchRelations = async (className: string) => {
  const relationsQuery = `
  # get all relations possible from HTTPAction and their range (to)
  SELECT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
      ?s rdf:type owl:ObjectProperty; 
         rdfs:label ?label;
         rdfs:range ?range;
         rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :${className}. 
  }}
  `;

  return await executeQuery(relationsQuery);
};

export const fetchDynamicRelations = async () => {
  const dynamicRelationsQuery = `
  # get all relations possible from Action to Action
  SELECT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
      ?s rdf:type owl:ObjectProperty; 
         rdfs:label ?label;
         rdfs:range :Action;
         rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :Action. 
  }}
  `;

  return await executeQuery(dynamicRelationsQuery);
};

export const fetchOntologyRelations = async (className: string) => {
  const ontologyRelationsQuery = `
  # get all relations possible from HTTPAction
  SELECT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
      ?s rdf:type owl:ObjectProperty; 
         rdfs:label ?label;
         rdfs:range ?range.
      {?s rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :Action.}
      UNION { ?s rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :${className}.}
  }}
  `;

  return await executeQuery(ontologyRelationsQuery);
};
