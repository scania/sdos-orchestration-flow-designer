import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import { env } from "../../../lib/env";
import { getToken } from "next-auth/jwt";
import axios from "axios";
import { TasksResponse } from "@/utils/types";
import { getSDOSOBOToken } from "@/lib/backend/sdosOBO";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("Tasks request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    const session = await getServerSession(req, res, authOptions);
    if (!session && env.NODE_ENV === "production") {
      logger.error("Unauthorized request.");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    if (!token) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { access_token } = await getSDOSOBOToken(token);

    logger.debug("Obtained SDOS OBO token:");
    if (!access_token) {
      logger.error("OBO token missing.");
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    switch (req.method) {
      case "GET":
        try {
          const response = await axios.get<TasksResponse>(
            `${env.SDOS_ENDPOINT}/sdos/getAllAvailableTasks`,
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          );

          logger.info("Fetched tasks successfully.");
          res.status(200).json(response.data);
        } catch (error) {
          logger.error("Error fetching tasks:", error);
          res.status(500).json({ error: "Failed to fetch tasks" });
        }
        break;

      default:
        logger.error("Method not allowed.");
        res.status(405).json({ error: "Method not allowed." });
        break;
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    logger.error("An unexpected error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
