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
