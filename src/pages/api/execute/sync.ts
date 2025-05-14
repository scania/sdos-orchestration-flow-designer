import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { env } from "@/lib/env";
import logger from "@/lib/logger";
import { getSDOSOBOToken } from "@/lib/backend/sdosOBO";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    logger.info("Tasks request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    const access_token = ctx.tokens.sdosOBO;
    logger.debug("Obtained SDOS OBO token.");

    switch (req.method) {
      case "POST": {
        logger.debug("POST request received.");
        const { subjectIri, parameters } = req.body;

        if (!subjectIri || !parameters) {
          logger.error("subjectIri or parameters missing in request body.");
          return res
            .status(400)
            .json({ error: "subjectIri and parameters are required." });
        }

        try {
          logger.info("Sending POST request to external API.");
          logger.debug("Request details:", {
            subjectIri,
            parameters,
            endpoint: `${env.SDOS_ENDPOINT}/sdos/runOrchestrationSync`,
          });

          const response = await axios.post(
            `${env.SDOS_ENDPOINT}/sdos/runOrchestrationSync`,
            { subjectIri, parameters },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
                Accept: "application/ld+json",
              },
            }
          );

          logger.info("Orchestration executed successfully.");
          logger.debug("API Response data:", response.data);

          const executionId = response.headers["executionid"] || null;
          if (executionId) {
            res.setHeader("Execution-Id", executionId);
          }

          return res.status(200).json(response.data);
        } catch (error: any) {
          logger.error("Error executing orchestration:", error?.message);
          logger.debug("Error details:", error);

          // Propagate Execution-Id header if present
          if (error?.response?.headers?.["executionid"]) {
            const executionId = error.response.headers["executionid"];
            res.setHeader("Execution-Id", executionId);
          }

          if (error.response) {
            const statusCode = error.response.status || 500;
            const errorData = error.response.data;
            logger.error("API Error Response:", errorData);

            let errorMessage = "Failed to execute orchestration";
            if (errorData && typeof errorData === "object") {
              if (
                Array.isArray(errorData.messages) &&
                errorData.messages.length > 0
              ) {
                errorMessage = errorData.messages.join(" ");
              } else if (errorData.error || errorData.message) {
                errorMessage = errorData.error || errorData.message;
              }
            } else if (typeof errorData === "string") {
              errorMessage = errorData;
            }

            return res.status(statusCode).json({ error: errorMessage });
          } else if (error.request) {
            logger.error("No response received from the API.");
            return res
              .status(503)
              .json({ error: "No response received from the API." });
          } else {
            logger.error("Error setting up the request:", error.message);
            return res.status(500).json({ error: error.message });
          }
        }
      }

      default: {
        logger.error("Method not allowed.");
        return res.status(405).json({ error: "Method not allowed." });
      }
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred:", error?.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth({ sdosOBO: getSDOSOBOToken })(handler);
