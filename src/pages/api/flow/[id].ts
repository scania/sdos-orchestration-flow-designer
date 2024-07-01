import {
  findUserByEmail,
  handleError,
  validateSession,
} from "@/lib/backend/helper";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { deleteGraph } from "@/services/stardogService";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await validateSession(req, res);
    if (!session || !session.user || !session.user.email) return;

    const user = await findUserByEmail(session.user.email, res);
    if (!user) return;

    const { id } = req.query;
    if (!id) {
      logger.error("Flow ID not provided.");
      return res.status(400).json({ error: "Flow ID not provided" });
    }
    const flow = await prisma.flow.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        description: true,
        state: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        isDraft: true,
      },
    });

    if (!flow) {
      logger.error("Flow not found.");
      return res.status(404).json({ error: "Flow not found" });
    }

    if (flow.userId !== user.id) {
      logger.error("Unauthorized access to flow.");
      return res.status(403).json({ error: "Forbidden" });
    }

    logger.info("Flow retrieved successfully.");

    switch (req.method) {
      case "GET":
        return res.status(200).json(flow);

      case "DELETE":
        if (!flow.isDraft) {
          await deleteGraph(flow.name);
        }

        const deleteFlow = await prisma.flow.delete({
          where: {
            id: id as string,
          },
        });
        return res.status(200).json(deleteFlow);

      default:
        logger.error("Method not allowed.");

        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    handleError(error, res);
  }
};
