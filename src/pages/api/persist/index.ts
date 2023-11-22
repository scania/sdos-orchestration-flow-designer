// pages/api/graphs/index.ts

import { GraphSchema } from "@/services/graphSchema";
import { NextApiRequest, NextApiResponse } from "next";
import { updateGraph } from "@/services/stardogService";

const mockGraphs = [
  {
    title: "Sample Graph",
    description: "A sample graph description.",
    nodes: ["NodeA", "NodeB", "NodeC"],
  },
];

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      const graphName = "http://example.org/Private";
      const graphData =
        "<http://example.org/Subject> <http://example.org/Predicate> <http://example.org/Object>";
      const response = await updateGraph(graphName, graphData);
      res.status(200).json(response);
      break;
    case "GET": //MOCK
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