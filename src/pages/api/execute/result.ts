import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { getOBOToken as getStardogOBOToken } from "@/lib/backend/stardogOBO";
import { getStardogInstance } from "@/services/stardogService";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    logger.info("Processing request for result graph.");
    const accessToken = ctx.tokens.stardogOBOToken;

    switch (req.method) {
      case "GET": {
        logger.debug("GET request received for result graph.");
        const { resultGraph, database } = req.query;
        if (
          !resultGraph ||
          typeof resultGraph !== "string" ||
          !database ||
          typeof database !== "string"
        ) {
          logger.error(
            "Missing or invalid 'resultGraph' or 'database' parameter."
          );
          return res.status(400).json({
            error: "Missing or invalid 'resultGraph' or 'database' parameter.",
          });
        }

        const stardog = getStardogInstance({
          token: accessToken,
          acceptHeader: "application/ld+json",
        });
        const graphResult = await stardog.fetchResultGraph(
          resultGraph,
          database
        );
        return res.status(200).json(graphResult);
      }

      case "DELETE": {
        logger.debug("DELETE request received for result graph.");
        const { resultGraph } = req.query;
        if (!resultGraph || typeof resultGraph !== "string") {
          logger.error("Missing or invalid 'resultGraph' parameter.");
          return res
            .status(400)
            .json({ error: "Missing or invalid 'resultGraph' parameter." });
        }

        const stardog = getStardogInstance({ token: accessToken });
        await stardog.deleteResultGraph(resultGraph);

        const deletedResult = await prisma.executionResult.deleteMany({
          where: { resultGraphURI: resultGraph },
        });

        return res.status(200).json({
          message: "Execution result deleted successfully",
          deleted: deletedResult,
        });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    logger.error("Error processing request", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth({ stardogOBOToken: getStardogOBOToken })(handler);
