import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { env } from "@/lib/env";
import logger from "@/lib/logger";
import { getSDOSOBOToken } from "@/lib/backend/sdosOBO";
import { respondApiError } from "@/lib/backend/httpError";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    logger.info("Execution log request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    const accessToken = ctx.tokens.sdosOBO;
    logger.debug("Obtained SDOS OBO token.");

    switch (req.method) {
      case "GET": {
        logger.debug("GET request received for execution logs.");
        const { executionId } = req.query;

        if (!executionId || typeof executionId !== "string") {
          logger.error(
            "executionId is missing or invalid in query parameters."
          );
          return res
            .status(400)
            .json({ error: "executionId query parameter is required." });
        }

        try {
          logger.info("Sending GET request to SDOS getExecutionlog endpoint.");
          logger.debug("Request details:", {
            executionId,
            endpoint: `${env.SDOS_ENDPOINT}/sdos/ls/getExecutionlog`,
          });

          const response = await axios.get(
            `${env.SDOS_ENDPOINT}/sdos/ls/getExecutionlog`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
              },
              params: { executionId },
            }
          );

          logger.info("Execution logs retrieved successfully.");
          logger.debug("API Response data:", response.data);

          return res.status(200).json(response.data);
        } catch (error: any) {
          return respondApiError(
            error,
            res,
            "Failed to retrieve execution logs"
          );
        }
      }

      default:
        logger.error("Method not allowed for execution logs endpoint.");
        return res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred:", error?.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth({ sdosOBO: getSDOSOBOToken })(handler);
