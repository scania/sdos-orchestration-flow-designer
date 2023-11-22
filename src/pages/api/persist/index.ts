// pages/api/graphs/index.ts

import { GraphBody, graphSave } from "@/services/graphSchema";
import { updateGraph } from "@/services/stardogService";
import { NextApiRequest, NextApiResponse } from "next";

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
      try {
        const parsedBody = graphSave.parse(req.body) as GraphBody;
        const { dbName, graphData } = parsedBody;
        const graphName = dbName;

        const response = await updateGraph(graphName, graphData);
        res.status(200).json(response);
      } catch (error) {
        res.status(400).json({ error: error });
      }

      break;
    default:
      res.status(405).json({ error: "Method not allowed." });
      break;
  }
};
