import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { env } from "@/lib/env";
import axios from "axios";
import { getSDOSOBOToken } from "@/lib/backend/sdosOBO";

const SDOS_STATUS_URL = `${env.SDOS_ENDPOINT}/sdos/v3/getExecutionStatus`;

type Status = "COMPLETE" | "FAILED" | "INCOMPLETE";

function normalizeState(s?: string): Status {
  const upper = (s || "").toUpperCase();
  if (upper === "COMPLETE") return "COMPLETE";
  if (upper === "FAILED") return "FAILED";
  if (upper === "INCOMPLETE") return "INCOMPLETE";
  // Default for unknown states
  return "INCOMPLETE";
}
function parsePositiveInt(
  val: string | string[] | undefined,
  fallback: number
) {
  const s = Array.isArray(val) ? val[0] : val;
  const n = parseInt(String(s ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
const key = (db: string, graph: string) => `${db}::${graph}`;

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

    const paginationValue = parsePositiveInt(req.query.paginationValue, 2);
    const rowsPerPage = parsePositiveInt(req.query.rowsPerPage, 10);
    const totalCount = await prisma.executionResult.count({ where: { iri } });
    const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;
    const take = Math.min(rowsPerPage, 100);
    const skip = (paginationValue - 1) * take;
    const executionResults = await prisma.executionResult.findMany({
      where: { iri },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });

    const requestBody = executionResults
      .map((item: any) => {
        const database = item.database;
        const graph = item.resultGraphURI;
        if (!graph || !database) return null;
        // Only include entries where we know both pieces
        return database ? { database, graph } : null;
      })
      .filter(Boolean);

    // Fetch statuses from SDOS
    let statusResponse: any[] | null = null;
    try {
      if (requestBody.length > 0) {
        const resp = await axios.post(SDOS_STATUS_URL, requestBody, {
          headers: {
            Authorization: `Bearer ${ctx.tokens.sdosOBO}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        statusResponse = resp.data;
      }
    } catch (err: any) {
      logger.error("Error fetching SDOS result graph status");
    }

    // Build status maps
    const statusMapByDbGraph: Record<string, Status> = {};
    const errorMapByDbGraph: Record<string, Record<string, string>> = {};

    if (Array.isArray(statusResponse)) {
      statusResponse.forEach((item: any) => {
        // Only record entries that actually have a state; errors (GRAPH_NOT_FOUND, DATABASE_NOT_EXISTS)
        // will be omitted and fall back to "NOT FOUND" later, matching previous behavior.
        if (!item.database || !item.graph) return;
        if (item?.state) {
          const s = item.state || "INCOMPLETE";
          statusMapByDbGraph[key(item.database, item.graph)] = s;
        }
        if (item?.errorCode || item?.message) {
          errorMapByDbGraph[key(item.database, item.graph)] = {
            errorCode: item.errorCode,
            message: item.message,
          };
        }
      });
    }

    // Combine with DB results
    const mappedResults = executionResults.map((result: any) => {
      const dbName = result.database;
      const resultGraphURI = result.resultGraphURI;
      const k = dbName && resultGraphURI ? key(dbName, resultGraphURI) : null;
      const status = (k ? statusMapByDbGraph[k] : undefined) || "NOT FOUND";
      const error = k ? errorMapByDbGraph[k] : null;
      if (error) {
        return {
          ...result,
          status,
          error,
        };
      }

      return {
        ...result,
        status,
      };
    });

    return res.status(200).json({
      data: mappedResults,
      pagination: {
        paginationValue,
        rowsPerPage,
        totalCount,
        totalPages,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching execution results", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth({ sdosOBO: getSDOSOBOToken })(handler);
