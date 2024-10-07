import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import { env } from "../../../lib/env";
import prisma from "@/lib/prisma";

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

    if (!session || !session.user || !session.user.id) {
      logger.warn("Unauthorized request attempted.", {
        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      });
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = session.user?.id;
    logger.debug("Session userId:", { userId });

    switch (req.method) {
      case "POST":
        await handlePostRequest(req, res, userId);
        break;
      case "GET":
        await handleGetRequest(req, res, userId);
        break;
      case "PUT":
        await handlePutRequest(req, res, userId);
        break;
      case "DELETE":
        await handleDeleteRequest(req, res, userId);
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

const handlePostRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const { name, flowId, iri, value } = req.body;

    if (!flowId && !iri) {
      res.status(400).json({ error: "Either flowId or iri must be provided." });
      return;
    }

    logger.debug("Creating a new parameter with data:", {
      name,
      userId,
      flowId,
      iri,
      value,
    });

    const newParameter = await prisma.parameter.create({
      data: {
        name,
        userId,
        flowId: flowId || null, // If flowId is not provided, set it to null
        iri: iri || null, // If iri is not provided, set it to null
        value,
      },
    });

    logger.info("Parameter created successfully.", { id: newParameter.id });
    res.status(201).json(newParameter);
  } catch (error) {
    console.log(error, "error console");
    logger.error("Error creating parameter.", { error });
    res.status(500).json({ error: "Failed to create parameter" });
  }
};

const handleGetRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const { id } = req.query;
    logger.debug("Fetching parameter by ID:", { id });

    const parameter = await prisma.parameter.findUnique({
      where: { id: id as string },
    });

    if (!parameter || parameter.userId !== userId) {
      logger.warn("Parameter not found or unauthorized access attempt.", {
        id,
        userId,
      });
      res.status(404).json({ error: "Parameter not found" });
      return;
    }

    logger.info("Parameter fetched successfully.", { id: parameter.id });
    res.status(200).json(parameter);
  } catch (error) {
    logger.error("Error fetching parameter.", { error });
    res.status(500).json({ error: "Failed to fetch parameter" });
  }
};

const handlePutRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const { id } = req.query;
    const { value } = req.body;
    logger.debug("Updating parameter with data");

    const existingParameter = await prisma.parameter.findUnique({
      where: { id: id as string },
    });

    if (!existingParameter || existingParameter.userId !== userId) {
      logger.warn("Parameter not found or unauthorized update attempt.", {
        id,
        userId,
      });
      res.status(404).json({ error: "Parameter not found" });
      return;
    }

    const updatedParameter = await prisma.parameter.update({
      where: { id: id as string },
      data: {
        value,
      },
    });

    logger.info("Parameter updated successfully.", { id: updatedParameter.id });
    res.status(200).json(updatedParameter);
  } catch (error) {
    logger.error("Error updating parameter.", { error });
    res.status(500).json({ error: "Failed to update parameter" });
  }
};

const handleDeleteRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => {
  try {
    const { id } = req.query;
    logger.debug("Deleting parameter by ID:", { id });

    const existingParameter = await prisma.parameter.findUnique({
      where: { id: id as string },
    });

    if (!existingParameter || existingParameter.userId !== userId) {
      logger.warn("Parameter not found or unauthorized delete attempt.", {
        id,
        userId,
      });
      res.status(404).json({ error: "Parameter not found" });
      return;
    }

    await prisma.parameter.delete({
      where: { id: id as string },
    });

    logger.info("Parameter deleted successfully.", { id });
    res.status(204).end();
  } catch (error) {
    logger.error("Error deleting parameter.", { error });
    res.status(500).json({ error: "Failed to delete parameter" });
  }
};
