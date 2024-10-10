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
    logger.info("Tasks request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    // Check the user session
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
      case "POST": {
        logger.debug("POST request received."); // Log request method

        // Extract subjectIri and parameters from the request body
        const { subjectIri, parameters } = req.body;

        if (!subjectIri || !parameters) {
          logger.error("subjectIri or parameters missing in request body.");
          res
            .status(400)
            .json({ error: "subjectIri and parameters are required." });
          return;
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
            {
              subjectIri,
              parameters,
            },
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
          console.log("API Response data:", response.data);
          res.status(200).json(response.data);
        } catch (error) {
          logger.error("Error executing orchestration:", error?.message);
          logger.debug("Error details:", error);
          res.status(500).json({ error: "Failed to execute orchestration" });
        }
        break;
      }

      default:
        logger.error("Method not allowed.");
        res.status(405).json({ error: "Method not allowed." });
        break;
    }
  } catch (error) {
    logger.error("An unexpected error occurred:", error?.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};