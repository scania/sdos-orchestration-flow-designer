import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import logger from "../../../lib/logger";
import { getOBOToken as getStardogOBOToken } from "../../../lib/backend/stardogOBO";
import { getStardogInstance } from "@/services/stardogService";
import { getToken } from "next-auth/jwt";
import { env } from "../../../lib/env";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    logger.info("Processing request for result graph.");
    // Validate session
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    switch (req.method) {
      case "GET": {
        const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
        if (!token) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const { access_token } = await getStardogOBOToken(token);
        if (!access_token) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const { resultGraph } = req.query;
        if (!resultGraph || typeof resultGraph !== "string") {
          return res
            .status(400)
            .json({ error: "Missing or invalid 'resultGraph' parameter." });
        }
        const stardog = getStardogInstance({
          token: access_token,
          accept: "application/ld+json",
        });
        const graphResult = await stardog.fetchResultGraph(resultGraph);
        return res.status(200).json(graphResult);
      }
      case "DELETE": {
        const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
        if (!token) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const { access_token } = await getStardogOBOToken(token);
        if (!access_token) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const { resultGraph } = req.query;
        if (!resultGraph || typeof resultGraph !== "string") {
          return res
            .status(400)
            .json({ error: "Missing or invalid 'resultGraph' parameter." });
        }
        const stardog = getStardogInstance({ token: access_token });
        await stardog.deleteResultGraph(resultGraph);
        const deletedResult = await prisma.executionResult.deleteMany({
          where: { resultGraphURI: resultGraph },
        });
        return res.status(200).json({
          message: "Execution result deleted successfully",
          deleted: deletedResult,
        });
      }
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error(error);
    logger.error("Error processing request", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
