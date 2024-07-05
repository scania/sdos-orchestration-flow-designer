import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import prisma from "../prisma";
import logger from "../logger";

export const validateSession = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    logger.error("Unauthorized request.");
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  if (!session.user) {
    logger.error("User not found in session.");
    res.status(401).json({ error: "User not found" });
    return null;
  }

  if (!session.user.id) {
    logger.error("User id not found in session.");
    res.status(401).json({ error: "User id not found" });
    return null;
  }

  return session;
};

export const findUserById = async (id: string, res: NextApiResponse) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    logger.error("User not found in database.");
    res.status(404).json({ error: "User not found" });
    return null;
  }

  return user;
};

export const handleError = (error: unknown, res: NextApiResponse) => {
  logger.error("An error occurred:", error);
  res.status(500).json({ error: "Internal Server Error" });
};
