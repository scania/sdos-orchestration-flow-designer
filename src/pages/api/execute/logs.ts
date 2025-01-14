import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import { env } from "../../../lib/env";
import { getToken } from "next-auth/jwt";
import axios from "axios";
import { getSDOSOBOToken } from "../../../lib/backend/sdosOBO";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("Execution log request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    //Check user session
    const session = await getServerSession(req, res, authOptions);
    if (!session && env.NODE_ENV === "production") {
      logger.error("Unauthorized request.");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Fetch the OBO token from the session
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
      case "GET": {
        logger.debug("GET request received for execution logs.");

        // Extract executionId from query parameters
        const { executionId } = req.query;
        if (!executionId || typeof executionId !== "string") {
          logger.error(
            "executionId is missing or invalid in query parameters."
          );
          res
            .status(400)
            .json({ error: "executionId query parameter is required." });
          return;
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
                Authorization: `Bearer ${access_token}`,
                Accept: "application/json",
              },
              params: { executionId },
            }
          );

          logger.info("Execution logs retrieved successfully.");
          logger.debug("API Response data:", response.data);

          res.status(200).json(response.data);
        } catch (error: any) {
          logger.error("Error retrieving execution logs:", error?.message);
          logger.debug("Error details:", error);

          if (error.response) {
            const statusCode = error.response.status || 500;
            const errorData = error.response.data;

            logger.error("API Error Response:", errorData);

            let errorMessage = "Failed to retrieve execution logs";
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

            res.status(statusCode).json({ error: errorMessage });
          } else if (error.request) {
            logger.error("No response received from the API.");
            res
              .status(503)
              .json({ error: "No response received from the API." });
          } else {
            logger.error("Error setting up the request:", error.message);
            res.status(500).json({ error: error.message });
          }
        }
        break;
      }

      default:
        logger.error("Method not allowed for execution logs endpoint.");
        res.status(405).json({ error: "Method not allowed." });
        break;
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred:", error?.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
