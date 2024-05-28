import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import prisma from "../../../lib/prisma";

interface Flow {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("flow request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      logger.error("Unauthorized request.");
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
            updatedAt: true,
          },
        });
        logger.info("Fetched classes successfully.");
        res.status(200).json(existingFlows);
        break;

      default:
        logger.error("Method not allowed.");
        res.status(405).json({ error: "Method not allowed." });
        break;
    }
  } catch (error) {
    console.log(error);

    logger.error("An error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
