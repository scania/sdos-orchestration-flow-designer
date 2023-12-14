// pages/api/graphs/index.ts

import { GraphBody, graphSave } from "@/services/graphSchema";
import { updateGraph } from "@/services/stardogService";
import { generateJsonLdFromState } from "@/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //get session not working here, to be investigated
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  switch (req.method) {
    case "POST":
      try {
        const parsedBody = graphSave.parse(req.body) as GraphBody;
        const { nodes, edges, graphName } = parsedBody;
        const graphData = generateJsonLdFromState({ nodes, edges });
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
