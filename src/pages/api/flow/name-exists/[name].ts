import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { handleError } from "@/lib/backend/helper";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    const session = ctx.session;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name } = req.query;
    if (!name) {
      logger.error("Flow name not provided.");
      return res.status(400).json({ error: "Flow name not provided" });
    }

    switch (req.method) {
      case "GET": {
        const flow = await prisma.flow.findFirst({
          where: { name: name as string },
        });
        return res.status(200).json(!!flow);
      }

      default:
        logger.error("Method not allowed.");
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    handleError(error, res);
  }
}

export default withAuth({})(handler);
