import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import prisma from "../../../lib/prisma";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("Flows request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      logger.error("Unauthorized request.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!session.user) {
      logger.error("User not found in session.");
      return res.status(401).json({ error: "User not found" });
    }

    if (!session.user.email) {
      logger.error("User email not found in session.");
      return res.status(401).json({ error: "User email not found" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      logger.error("User not found in database.");
      return res.status(404).json({ error: "User not found" });
    }

    switch (req.method) {
      case "GET":
        const existingFlows = await prisma.flow.findMany({
          where: {
            userId: user.id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            isDraft: true,
            updatedAt: true,
          },
          orderBy: [
            {
              updatedAt: "desc",
            },
          ],
        });

        logger.info("Fetched flows successfully.");
        return res.status(200).json(existingFlows);

      default:
        logger.error("Method not allowed.");
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    logger.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
