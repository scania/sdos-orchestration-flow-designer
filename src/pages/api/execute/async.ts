import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { env } from "@/lib/env";
import logger from "@/lib/logger";
import { getSDOSOBOToken } from "@/lib/backend/sdosOBO";
import prisma from "@/lib/prisma";
import { respondApiError } from "@/lib/backend/httpError";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    logger.info("Async orchestration request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

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
        logger.info(
          "Sending POST request to asynchronous orchestration endpoint."
        );
        const response = await axios.post(
          `${env.SDOS_ENDPOINT}/sdos/runOrchestration`,
          { subjectIri, parameters },
          {
            headers: {
              Authorization: `Bearer ${ctx.tokens.sdosOBO}`,
              "Content-Type": "application/json",
              Accept: "application/ld+json",
            },
          }
        );

        logger.info("Async orchestration initiated successfully.");
        logger.debug("API response data:", response.data);

        const executionId = response.headers["executionid"] || null;
        if (executionId) {
          res.setHeader("Execution-Id", executionId);
        }

        const newExecutionResult = await prisma.executionResult.create({
          data: {
            iri: subjectIri,
            userId: ctx.session!.user.id,
            resultGraphURI: response.data.resultgraph,
            executionParameters: parameters,
          },
        });

        return res.status(200).json(newExecutionResult);
      } catch (error: any) {
        return respondApiError(error, res, "Failed to execute orchestration");
      }
    } else {
      return res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred:", error?.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth({ sdosOBO: getSDOSOBOToken })(handler);
