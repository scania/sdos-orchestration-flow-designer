import { handleError, validateSession } from "@/lib/backend/helper";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await validateSession(req, res);
    if (!session || !session.user || !session.user.email) return;

    const { name } = req.query;
    if (!name) {
      logger.error("Flow name not provided.");
      return res.status(400).json({ error: "Flow name not provided" });
    }

    switch (req.method) {
      case "GET":
        const flow = await prisma.flow.findFirst({
          where: { name: name as string },
        });
        console.log("existing name", flow, name);
        if (flow) {
          return res.status(200).json(true);
        }
        return res.status(200).json(false);

      default:
        logger.error("Method not allowed.");

        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    handleError(error, res);
  }
};
