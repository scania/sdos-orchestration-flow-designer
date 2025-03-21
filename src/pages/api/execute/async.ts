import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { getToken } from "next-auth/jwt";
import axios from "axios";
import { env } from "../../../lib/env";
import logger from "../../../lib/logger";
import { getSDOSOBOToken } from "../../../lib/backend/sdosOBO";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    logger.info("Async orchestration request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    // Check the user session
    const session = await getServerSession(req, res, authOptions);
    if (!session && env.NODE_ENV === "production") {
      logger.error("Unauthorized request.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Retrieve the OBO token
    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    if (!token) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { access_token } = await getSDOSOBOToken(token);
    if (!access_token) {
      logger.error("OBO token missing.");
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.method === "POST") {
      logger.debug("POST request received for async orchestration.");
      const { subjectIri, parameters } = req.body;
      if (!subjectIri || !parameters) {
        logger.error("subjectIri or parameters missing in request body.");
        return res
          .status(400)
          .json({ error: "subjectIri and parameters are required." });
      }

      try {
        // Call the asynchronous orchestration endpoint
        logger.info(
          "Sending POST request to asynchronous orchestration endpoint."
        );
        const response = await axios.post(
          `${env.SDOS_ENDPOINT}/sdos/runOrchestration`,
          { subjectIri, parameters },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
              Accept: "application/ld+json",
            },
          }
        );

        logger.info("Async orchestration initiated successfully.");
        logger.debug("API response data:", response.data);

        // Extract the result graph IRI from the response
        const resultGraphIRI = response.data.resultgraph;
        const executionId = response.headers["executionid"] || null;
        if (executionId) {
          res.setHeader("Execution-Id", executionId);
        }

        // Save the result in the database
        const newExecutionResult = await prisma.executionResult.create({
          data: {
            iri: subjectIri,
            userId: session.user.id,
            resultGraphURI: resultGraphIRI,
            executionParameters: parameters,
          },
        });

        return res.status(200).json(newExecutionResult);
      } catch (error: any) {
        logger.error(
          "Error executing asynchronous orchestration:",
          error?.message
        );
        if (error?.response?.headers?.["executionid"]) {
          res.setHeader("Execution-Id", error.response.headers["executionid"]);
        }
        if (error.response) {
          const statusCode = error.response.status || 500;
          let errorMessage = "Failed to execute asynchronous orchestration";
          const errorData = error.response.data;
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
          return res
            .status(503)
            .json({ error: "No response received from the API." });
        } else {
          return res.status(500).json({ error: error.message });
        }
      }
    } else {
      return res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred:", error?.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
