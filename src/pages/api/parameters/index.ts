import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import { env } from "../../../lib/env";
import prisma from "@/lib/prisma";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("Parameter request received.");
    logger.debug("Request details:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    const session = await getServerSession(req, res, authOptions);
    logger.debug("Session details:", { session });

    if (!session || !session.user || env.NODE_ENV === "production") {
      logger.warn("Unauthorized request attempted.", {
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      });
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = session.user.id;
    logger.debug("Session userId:", { userId });

    switch (req.method) {
      case "GET":
        await handleGetRequest(req, res, userId);
        break;

      default:
        logger.warn("Method not allowed.", { method: req.method });
        res.status(405).json({ error: "Method not allowed." });
        break;
    }
  } catch (error) {
    logger.error("An unexpected error occurred.", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const { flowId, iri } = req.query;
    logger.debug("Fetching parameters with query:", { flowId, iri });

    const parameters = await prisma.parameter.findMany({
      where: {
        userId,
        AND: [
          flowId ? { flowId: flowId as string } : {},
          iri ? { iri: iri as string } : {},
        ],
      },
    });

    logger.info("Fetched parameters successfully.", {
      count: parameters.length,
    });
    res.status(200).json(parameters);
  } catch (error) {
    logger.error("Error fetching parameters.", { error });
    res.status(500).json({ error: "Failed to fetch parameters" });
  }
};
