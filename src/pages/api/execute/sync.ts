import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import { env } from "../../../lib/env";
import { getToken } from "next-auth/jwt";
import axios from "axios";

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
    const oboToken = token?.sdosOBO?.token;
    logger.debug("Obtained OBO token:", oboToken); // Log the OBO token
    if (!oboToken) {
      logger.error("OBO token missing.");
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    switch (req.method) {
      case "POST": {
        logger.debug("POST request received."); // Log request method

        // Extract subjectIri and parameters from the request body
        const { subjectIri, parameters } = req.body;

        console.log("Request body:", { subjectIri, parameters }); // Log the received body

        if (!subjectIri || !parameters) {
          logger.error("subjectIri or parameters missing in request body.");
          res
            .status(400)
            .json({ error: "subjectIri and parameters are required." });
          return;
        }

        try {
          // Log the outbound request details
          logger.info("Sending POST request to external API.");
          logger.debug("Request details:", {
            subjectIri,
            parameters,
            endpoint: `${env.SDOS_ENDPOINT}/sdos/runOrchestrationSync`,
          });

          // Make a POST request to the external API with the provided data
          const response = await axios.post(
            `${env.SDOS_ENDPOINT}/sdos/runOrchestrationSync`, // Adjust endpoint accordingly
            {
              subjectIri,
              parameters,
            },
            {
              headers: {
                Authorization: `Bearer ${oboToken}`,
                "Content-Type": "application/json",
                Accept: "application/ld+json",
              },
            }
          );

          logger.info("Orchestration executed successfully.");
          logger.debug("API Response data:", response.data); // Log the response data
          console.log("API Response data:", response.data); // Log the response data
          res.status(200).json(response.data);
        } catch (error) {
          logger.error("Error executing orchestration:", error?.message);
          logger.debug("Error details:", error); // Log the full error object
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
    logger.debug("Error details:", error); // Log the full error object
    res.status(500).json({ error: "Internal Server Error" });
  }
};
