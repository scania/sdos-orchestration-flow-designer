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
    logger.info("Fetching execution results by IRI.");
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    if (!token) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { access_token } = await getStardogOBOToken(token);

    if (!access_token) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { iri } = req.query;
    if (!iri || typeof iri !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'iri' parameter." });
    }

    const executionResults = await prisma.executionResult.findMany({
      where: { iri },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Extract all resultGraphURIs from the execution results.
    const resultGraphURIs = executionResults.map((item) => item.resultGraphURI);
    const stardog = getStardogInstance({ token: access_token });

    let statusResponse: any = null;
    try {
      statusResponse = await stardog.fetchResultGraphStatus(resultGraphURIs);
    } catch (err) {
      logger.error("Error fetching stardog result graph status");
      statusResponse = null;
    }
    // Build a lookup of status keyed by graph URI.
    const statusMap: Record<string, "COMPLETE" | "FAILED" | "INCOMPLETE"> = {};
    if (statusResponse) {
      statusResponse.forEach((item: any) => {
        if (item.graph?.value && item.state?.value) {
          statusMap[item.graph.value] = item.state.value;
        }
      });
    }
    // Map the status from Stardog into the execution results.
    const mappedResults = executionResults.map((result) => ({
      ...result,
      status: statusMap[result.resultGraphURI] || "NOT FOUND",
    }));
    return res.status(200).json(mappedResults);
  } catch (error: any) {
    logger.error("Error fetching execution results", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
