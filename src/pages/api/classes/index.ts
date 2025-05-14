import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { getStardogInstance } from "@/services/stardogService";
import logger from "@/lib/logger";
import { getOBOToken as getStardogOBOToken } from "@/lib/backend/stardogOBO";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    logger.info("Class request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });

    const stardog = getStardogInstance({ token: ctx.tokens.stardogOBOToken });

    switch (req.method) {
      case "GET": {
        const response = await stardog.fetchClasses(ctx.tokens.stardogOBOToken);
        logger.info("Fetched classes successfully.");
        return res.status(200).json(response);
      }
      default:
        logger.error("Method not allowed.");
        return res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error: any) {
    logger.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth({ stardogOBOToken: getStardogOBOToken })(handler);
