import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { getSDOSOBOToken } from "@/lib/backend/sdosOBO";
import { env } from "../../../lib/env";
import logger from "../../../lib/logger";
import { TasksResponse } from "@/utils/types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    logger.info("Parameter request received.");
    logger.debug("Request details:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    switch (req.method) {
      case "GET": {
        const { iri } = req.query;
        try {
          const response = await axios.get<TasksResponse>(
            `${env.SDOS_ENDPOINT}/sdos/getAllAvailableTasks`,
            {
              headers: {
                Authorization: `Bearer ${ctx.tokens.sdosOBO}`,
              },
            }
          );

          const task = response.data.tasks.find((t) => t.subjectIri === iri);
          if (!task) {
            logger.warn(`Task with IRI ${iri} not found.`);
            return res.status(200).json([]);
          }
          logger.info("Fetched template successfully.");
          return res.status(200).json(task.parameters);
        } catch (error: any) {
          logger.error("Error fetching tasks:", error);
          return res.status(500).json({ error: "Failed to fetch tasks" });
        }
      }

      default:
        logger.warn("Method not allowed.", { method: req.method });
        return res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred.", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth({ sdosOBO: getSDOSOBOToken })(handler);
