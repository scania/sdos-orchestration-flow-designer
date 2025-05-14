import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { findUserById, handleError } from "@/lib/backend/helper";
import { GraphBody, graphSave } from "@/services/graphSchema";
import { getStardogInstance } from "@/services/stardogService";
import { generateJsonLdFromState } from "@/utils";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { getOBOToken as getStardogOBOToken } from "@/lib/backend/stardogOBO";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    logger.debug("Received request", { method: req.method, url: req.url });

    const session = ctx.session;
    if (!session?.user?.id) {
      logger.warn("Invalid session or user ID missing");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await findUserById(session.user.id, res);
    if (!user) {
      logger.warn("User not found", { userId: session.user.id });
      return res.status(404).json({ error: "User not found" });
    }

    const stardog = getStardogInstance({ token: ctx.tokens.stardogOBOToken });
    logger.debug("Stardog instance initialized");

    switch (req.method) {
      case "POST":
        logger.debug("Handling POST request");

        let parsedBody: GraphBody;
        try {
          parsedBody = graphSave.parse(req.body) as GraphBody;
          logger.debug("Request body parsed successfully");
        } catch (parseError) {
          logger.error("Error parsing request body", { error: parseError });
          return res.status(400).json({ error: "Invalid request body" });
        }

        const { nodes, edges, graphName, description, isDraft } = parsedBody;
        logger.debug("Parsed body data", {
          nodesCount: nodes?.length,
          edgesCount: edges?.length,
          graphName,
          isDraft,
        });

        if (!nodes || !edges) {
          logger.warn("Nodes or edges missing in request body");
          return res
            .status(400)
            .json({ error: "Nodes and edges are required" });
        }

        const metadata = { email: user.email || "" };
        const graphData = generateJsonLdFromState({ nodes, edges, metadata });

        if (!isDraft) {
          try {
            await stardog.updateGraph(graphName, graphData);
            logger.info("Graph saved to Stardog", { graphName });
          } catch (stardogError) {
            logger.error("Error saving graph to Stardog", {
              error: stardogError,
            });
            return res.status(500).json({ error: "Error saving to Stardog" });
          }
        }

        let response;
        try {
          const existingFlow = await prisma.flow.findFirst({
            where: {
              name: graphName,
              userId: user.id,
            },
          });
          logger.debug("Existing flow check", {
            flowExists: !!existingFlow,
            graphName,
            userId: user.id,
          });

          if (existingFlow) {
            response = await prisma.flow.update({
              where: { id: existingFlow.id },
              data: {
                description: description || "",
                state: JSON.stringify({ nodes, edges }),
                isDraft,
              },
            });
            logger.info("Flow updated in database", {
              flowId: existingFlow.id,
            });
          } else {
            response = await prisma.flow.create({
              data: {
                name: graphName,
                description: description || "",
                state: JSON.stringify({ nodes, edges }),
                user: { connect: { id: user.id } },
                isDraft,
              },
            });
            logger.info("New flow created in database", {
              flowId: response.id,
            });
          }
        } catch (dbError) {
          logger.error("Database operation failed", { error: dbError });
          return res.status(500).json({ error: "Database operation failed" });
        }

        if (response) {
          logger.debug("Sending success response", { response });
          return res.status(200).json(response);
        } else {
          logger.error("No response from database operation");
          return res.status(500).json({ error: "Failed to save flow" });
        }

      default:
        logger.warn("Unsupported HTTP method", { method: req.method });
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    logger.error("Unhandled exception", { error });
    return handleError(error, res);
  }
}

export default withAuth({ stardogOBOToken: getStardogOBOToken })(handler);
