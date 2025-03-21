import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import logger from "../../../lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    logger.info("Fetching execution results by IRI.");
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { iri } = req.query;
    if (!iri || typeof iri !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'iri' parameter." });
    }

    const executionResults = await prisma.executionResult.findMany({
      where: { iri },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(executionResults);
  } catch (error: any) {
    logger.error("Error fetching execution results", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
