import {
  findUserById,
  handleError,
  validateSession,
} from "@/lib/backend/helper";
import { GraphBody, graphSave } from "@/services/graphSchema";
import { updateGraph } from "@/services/stardogService";
import { generateJsonLdFromState } from "@/utils";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import logger from "@/lib/logger";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await validateSession(req, res);
    if (!session || !session.user || !session.user.id) return;

    const user = await findUserById(session.user.id, res);
    if (!user) return;

    switch (req.method) {
      case "POST":
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

        break;
      default:
        res.status(405).json({ error: "Method not allowed." });
        break;
    }
  } catch (error) {
    handleError(error, res);
  }
};
