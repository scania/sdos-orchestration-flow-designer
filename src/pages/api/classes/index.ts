import { fetchClasses } from "@/services/stardogService";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("Class request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      logger.error("Unauthorized request.");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    switch (req.method) {
      case "GET":
        const response = await fetchClasses();
        logger.info("Fetched classes successfully.");
        res.status(200).json(response);
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
