import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { getOBOToken as getStardogOBOToken } from "@/lib/backend/stardogOBO";
import { getStardogInstance } from "@/services/stardogService";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    logger.info("Fetching execution results by IRI.");

    if (req.method !== "GET") {
      logger.error("Method not allowed.");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { iri } = req.query;
    if (!iri || typeof iri !== "string") {
      logger.error("Missing or invalid 'iri' parameter.");
      return res
        .status(400)
        .json({ error: "Missing or invalid 'iri' parameter." });
    }

    // Load from database
    const executionResults = await prisma.executionResult.findMany({
      where: { iri },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Fetch statuses from Stardog
    const resultGraphURIs = executionResults.map((item) => item.resultGraphURI);
    const stardog = getStardogInstance({ token: ctx.tokens.stardogOBOToken });
    let statusResponse: any = null;

    try {
      statusResponse = await stardog.fetchResultGraphStatus(resultGraphURIs);
    } catch (err) {
      logger.error("Error fetching stardog result graph status", err);
    }

    // Build status map
    const statusMap: Record<string, "COMPLETE" | "FAILED" | "INCOMPLETE"> = {};
    if (statusResponse) {
      statusResponse.forEach((item: any) => {
        if (item.graph?.value && item.state?.value) {
          statusMap[item.graph.value] = item.state.value;
        }
      });
    }

    // Combine with DB results
    const mappedResults = executionResults.map((result) => ({
      ...result,
      status: statusMap[result.resultGraphURI] || "NOT FOUND",
    }));

    return res.status(200).json(mappedResults);
  } catch (error: any) {
    logger.error("Error fetching execution results", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth({ stardogOBOToken: getStardogOBOToken })(handler);
