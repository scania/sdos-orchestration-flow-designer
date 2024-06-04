// pages/api/graphs/index.ts

import { GraphBody, graphSave } from "@/services/graphSchema";
import { updateGraph } from "@/services/stardogService";
import { generateJsonLdFromState } from "@/utils";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";
import logger from "@/lib/logger";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //get session not working here, to be investigated
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!session.user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  if (!session.user.email) {
    res.status(401).json({ error: "User Email not found" });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  switch (req.method) {
    case "POST":
      try {
        const parsedBody = graphSave.parse(req.body) as GraphBody;
        const { nodes, edges, graphName, description, isDraft } = parsedBody;
        if (!nodes || !edges) {
          res.status(501).json({ error: "Nodes and Edges not found" });
          return;
        }
        const graphData = generateJsonLdFromState({ nodes, edges });

        if (!isDraft) {
          try {
            await updateGraph(graphName, graphData); //saving to stardog
            logger.info("saved to stardog");
          } catch (error) {
            logger.error("error saving to stardog");
            res.status(501).json({ error: "Error Saving to Stardog" });
          }
        }

        // Check if a Flow with the same name exists for this user
        const existingFlow = await prisma.flow.findFirst({
          where: {
            name: graphName,
            userId: user.id,
          },
        });
        let response;
        if (existingFlow) {
          // Update the existing Flow
          response = await prisma.flow.update({
            where: { id: existingFlow.id },
            data: {
              description: description || "",
              state: JSON.stringify({ nodes, edges }),
              isDraft,
            },
          });
        }

        if (!existingFlow) {
          response = await prisma.flow.create({
            data: {
              name: graphName,
              description: description || "",
              state: JSON.stringify({ nodes, edges }),
              user: { connect: { id: user.id } },
              isDraft,
            },
          });
        }
        if (response) {
          res.status(200).json(response);
        }
      } catch (error) {
        res.status(400).json({ error: error });
      }
      break;
    default:
      res.status(405).json({ error: "Method not allowed." });
      break;
  }
};
