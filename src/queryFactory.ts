import { JsonLdDocument } from "jsonld";

export enum PREFIXES {
  ALL = ` 
    PREFIX : <https://kg.scania.com/it/iris_orchestration/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
`,
  IRIS = "https://kg.scania.com/it/iris_orchestration/",
}

export class QueryFactory {
  // To drop graph
  public static dropGraph(graphName: string): string {
    return `DROP SILENT GRAPH <${graphName}>`;
  }

  // To insert data
  public static insertData(
    graphName: string,
    graphData: JsonLdDocument
  ): string {
    return `INSERT DATA { GRAPH <${graphName}> { ${graphData} }}`;
  }

  // To get all relations possible from HTTPAction and their range (to)
  public static relationsQuery(className: string): string {
    return `
      ${PREFIXES}
      SELECT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
          ?s rdf:type owl:ObjectProperty; 
            rdfs:label ?label;
            rdfs:range ?range;
            rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :${className}. 
      }}
      `;
  }
  // To get all relations possible from className eg: HTTPAction
  public static ontologyRelationsQuery(className: string): string {
    return `
        ${PREFIXES}
        SELECT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
            ?s rdf:type owl:ObjectProperty; 
              rdfs:label ?label;
              rdfs:range ?range.
            {?s rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :Action.}
            UNION { ?s rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :${className}.}
        }}`;
  }

  // To get all relations possible from Action to Action
  public static dynamicRelationsQuery(): string {
    return `
      ${PREFIXES}
      SELECT * { graph <file:///orchestration_ontology.ttl-08-11-2023-03-26-33> { 
          ?s rdf:type owl:ObjectProperty; 
            rdfs:label ?label;
            rdfs:range :Action;
            rdfs:domain/(owl:unionOf/rdf:rest*/rdf:first)* :Action. 
      }}
  `;
  }

  public static resultGraphQuery(resultGraph: string): string {
    return `
   PREFIX : <https://kg.scania.com/it/iris_orchestration/>
CONSTRUCT { ?s ?p ?o }
WHERE {
  GRAPH <${resultGraph}> {
    ?s ?p ?o .
  }
}
  `;
  }

  public static deleteResultGraphQuery(resultGraph: string): string {
    return `
  CLEAR GRAPH <${resultGraph}>
  `;
  }
}
