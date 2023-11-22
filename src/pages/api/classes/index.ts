// pages/api/graphs/index.ts

import { NextApiRequest, NextApiResponse } from "next";
import { fetchClasses } from "@/services/stardogService";

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
      const response = await fetchClasses();
      res.status(200).json(response);
      break;

    default:
      res.status(405).json({ error: "Method not allowed." });
      break;
  }
};
