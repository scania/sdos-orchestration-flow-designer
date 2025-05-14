import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { findUserById, handleError } from "@/lib/backend/helper";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { getOBOToken as getStardogOBOToken } from "@/lib/backend/stardogOBO";
import { getStardogInstance } from "@/services/stardogService";
import { env } from "@/lib/env";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    const session = ctx.session!;
    const user = await findUserById(session.user.id, res);
    if (!user) return;

    const flowId = req.query.id as string | undefined;
    if (!flowId) {
      logger.error("Flow ID not provided.");
      return res.status(400).json({ error: "Flow ID not provided" });
    }

    const flow = await prisma.flow.findUnique({
      where: { id: flowId },
      select: {
        id: true,
        name: true,
        description: true,
        state: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        isDraft: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!flow) {
      logger.error("Flow not found.");
      return res.status(404).json({ error: "Flow not found" });
    }

    logger.info("Flow retrieved successfully.");

    const accessToken = ctx.tokens.stardogOBOToken;
    const stardog = getStardogInstance({ token: accessToken });

    switch (req.method) {
      case "GET":
        return res.status(200).json(flow);

      case "DELETE": {
        const adminEmails =
          env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
        const isAdmin = adminEmails.includes(user.email);
        if (flow.userId !== user.id && !isAdmin) {
          logger.error("User not authorized to delete this flow.");
          return res.status(403).json({ error: "Forbidden" });
        }

        if (!flow.isDraft) {
          await stardog.deleteGraph(flow.name);
        }

        const deletedFlow = await prisma.flow.delete({
          where: { id: flowId },
        });

        logger.info("Flow deleted successfully.");
        return res.status(200).json(deletedFlow);
      }

      default:
        logger.error("Method not allowed.");
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    return handleError(error, res);
  }
}

export default withAuth({ stardogOBOToken: getStardogOBOToken })(handler);
