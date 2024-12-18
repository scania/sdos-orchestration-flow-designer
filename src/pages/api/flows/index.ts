import { NextApiRequest, NextApiResponse } from "next";
import logger from "../../../lib/logger";
import prisma from "../../../lib/prisma";
import {
  handleError,
  validateSession,
  findUserById,
} from "@/lib/backend/helper";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("Flows request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    const session = await validateSession(req, res);
    if (!session || !session.user || !session.user.id) return;
    const user = await findUserById(session.user.id, res);
    if (!user) return;

    switch (req.method) {
      case "GET":
        const existingFlows = await prisma.flow.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            isDraft: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
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
    handleError(error, res);
  }
};
