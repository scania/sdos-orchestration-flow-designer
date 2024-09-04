import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import { env } from "../../../lib/env";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import axios from "axios";
import { TasksResponse } from "@/utils/types";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("Parameter request received.");
    logger.debug("Request details:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    const session = await getServerSession(req, res, authOptions);
    logger.debug("Session details:", { session });

    if (!session || !session.user || env.NODE_ENV === "production") {
      logger.warn("Unauthorized request attempted.", {
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      });
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    const oboToken = token?.sdosOBO?.token;
    switch (req.method) {
      case "GET":
        const { iri } = req.query;

        try {
          const response = await axios.get<TasksResponse>(
            `${env.SDOS_ENDPOINT}/sdos/getAllAvailableTasks`,
            {
              headers: {
                Authorization: `Bearer ${oboToken}`,
              },
            }
          );

          const data = response.data;

          const task = data.tasks.find((task) => task.subjectIri === iri);
          if (!task) {
            logger.warn(`Task with IRI ${iri} not found.`);
            res.status(200).json([]);
          }
          logger.info("Fetched template successfully.");
          res.status(200).json(task?.parameters);
        } catch (error) {
          logger.error("Error fetching tasks:", error);
          res.status(500).json({ error: "Failed to fetch tasks" });
        }
        break;
      default:
        logger.warn("Method not allowed.", { method: req.method });
        res.status(405).json({ error: "Method not allowed." });
        break;
    }
  } catch (error) {
    logger.error("An unexpected error occurred.", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
