import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { validateSession } from "@/lib/backend/helper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await validateSession(req, res);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { flowId } = req.query;

    if (typeof flowId !== "string") {
      logger.error("Invalid flowId provided.");
      return res.status(400).json({ error: "Invalid flowId provided" });
    }

    const flow = await prisma.flow.findUnique({
      where: {
        id: flowId,
      },
      select: {
        name: true,
      },
    });

    if (!flow) {
      logger.error("Flow not found.");
      return res.status(404).json({ error: "Flow not found" });
    }

    logger.info("IRI retrieved successfully.", { flowId, iri: flow.name });
    return res.status(200).json({ iri: flow.name });
  } catch (error) {
    logger.error("An error occurred while retrieving the IRI.", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
