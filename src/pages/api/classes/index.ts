import { getStardogInstance } from "@/services/stardogService";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import { env } from "../../../lib/env";
import { getToken } from "next-auth/jwt";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("Class request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });
    const session = await getServerSession(req, res, authOptions);
    if (!session && env.NODE_ENV === "production") {
      logger.error("Unauthorized request.");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    const oboToken = token?.stardogOBO?.token;
    if (!oboToken) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const stardog = getStardogInstance({ token: oboToken });
    switch (req.method) {
      case "GET":
        const response = await stardog.fetchClasses(oboToken);
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
