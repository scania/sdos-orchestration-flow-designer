// pages/api/graphs/index.ts

import { GraphSchema } from "@/api/services/graphSchema";
import { NextApiRequest, NextApiResponse } from "next";
import stardogConnection from "../../../connections/stardog";
import { query } from "stardog";

const mockGraphs = [
  {
    title: "Sample Graph",
    description: "A sample graph description.",
    nodes: ["NodeA", "NodeB", "NodeC"],
  },
];

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      const testQuery = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX : <https://kg.scania.com/it/iris_orchestration/> 
      SELECT * {   ?s  rdf:type owl:Class; rdfs:label ?label .} LIMIT 1000`;
      let queryResult: string | any[] = [];

      await query
        .execute(stardogConnection, "Purchasing360", testQuery)
        .then(({ body }) => {
          console.log(
            "Connection successful. Query result:",
            body.results.bindings
          );
          queryResult = body.results.bindings;
          console.log(queryResult.length);
        })
        .catch((error) => {
          console.error("Connection failed:", error);
        });

      res.status(200).json(queryResult);
      break;

    case "POST":
      try {
        const parsedGraph = GraphSchema.parse(req.body);
        const graphWithDefaults = {
          ...parsedGraph,
          description: parsedGraph.description || "Default description",
        };
        mockGraphs.push(graphWithDefaults);
        res.status(201).json(parsedGraph);
      } catch (error) {
        res.status(400).json({ error: "Invalid graph data provided." });
      }
      break;

    default:
      res.status(405).json({ error: "Method not allowed." });
      break;
  }
};
