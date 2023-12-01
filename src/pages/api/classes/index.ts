// pages/api/graphs/index.ts

import { fetchClasses } from "@/services/stardogService";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
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
