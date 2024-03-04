import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

import { Validator } from "shacl-engine";
import rdfDataModel from "@rdfjs/data-model";
import rdfDataset from "@rdfjs/dataset";

//const Validator = require("shacl-engine");
//const SHACLERrror = require("shacl-engine");

// Define your RDF data (turtle format)
const rdfData = `
@prefix ex: <http://example.org/> .

ex:John a ex:Person ;
    ex:name "John" .
`;

// Define your SHACL shapes (turtle format)
const shaclShapes = `
@prefix ex: <http://example.org/> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:PersonShape
    a sh:NodeShape ;
    sh:targetClass ex:Person ;
    sh:property [
        sh:path ex:age ;
        sh:datatype xsd:integer ;
        sh:minInclusive 0 ;
    ] .
`;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //get session not working here, to be investigated
  const session = await getServerSession(req, res, authOptions);
  /*if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }*/
  switch (req.method) {
    case "GET":
      console.log("validate 1");

      const dataset = rdfDataset.dataset();
      // Create a new SHACL validator instance
      const validator = new Validator(dataset, { factory: rdfDataModel });
      console.log("validate 2");

      // Perform validation
      validator
        .validate(rdfData, shaclShapes)
        .then((conforms: boolean) => {
          if (conforms) {
            console.log("Validation successful!");
          } else {
            console.error("Validation failed!");
          }
        })
        .catch((error: any) => {
          console.error("Error occurred during validation:", error.message);
        });

      console.log("validate 4");

      res.status(200).json("Done");

      break;
    default:
      res.status(405).json({ error: "Method not allowed." });
      break;
  }
};
