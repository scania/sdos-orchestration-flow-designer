import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { env } from "@/lib/env";
import logger from "@/lib/logger";
import { getSDOSOBOToken } from "@/lib/backend/sdosOBO";
import { TasksResponse } from "@/utils/types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    logger.info("Tasks request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    switch (req.method) {
      case "GET": {
        try {
          const response = await axios.get<TasksResponse>(
            `${env.SDOS_ENDPOINT}/sdos/getAllAvailableTasks`,
            {
              headers: {
                Authorization: `Bearer ${ctx.tokens.sdosOBO}`,
              },
            }
          );

          logger.info("Fetched tasks successfully.");
          return res.status(200).json(response.data);
        } catch (error: any) {
          logger.error("Error fetching tasks:", error);
          return res.status(500).json({ error: "Failed to fetch tasks" });
        }
      }

      default:
        logger.error("Method not allowed.");
        return res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth({ sdosOBO: getSDOSOBOToken })(handler);
