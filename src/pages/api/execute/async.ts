import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    logger.info("ExecutionResult request received.");
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userId = session.user.id;

    switch (req.method) {
      case "POST":
        return await handlePostRequest(req, res, userId);
      case "GET":
        return await handleGetRequest(req, res, userId);
      default:
        res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error) {
    logger.error("Unexpected error in execution-result endpoint", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handlePostRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { flowId, resultGraphURI, executionParameters } = req.body;
    if (!flowId || !resultGraphURI || executionParameters === undefined) {
      res.status(400).json({
        error:
          "Missing required fields: flowId, resultGraphURI, executionParameters.",
      });
      return;
    }

    const newExecutionResult = await prisma.executionResult.create({
      data: {
        flowId,
        userId,
        resultGraphURI,
        executionParameters,
      },
    });
    res.status(201).json(newExecutionResult);
  } catch (error) {
    logger.error("Error creating execution result", { error });
    res.status(500).json({ error: "Failed to create execution result" });
  }
}

async function handleGetRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing id parameter." });
      return;
    }

    const executionResult = await prisma.executionResult.findUnique({
      where: { id: id as string },
    });
    if (!executionResult || executionResult.userId !== userId) {
      res.status(404).json({ error: "Execution result not found" });
      return;
    }
    res.status(200).json(executionResult);
  } catch (error) {
    logger.error("Error fetching execution result", { error });
    res.status(500).json({ error: "Failed to fetch execution result" });
  }
}
