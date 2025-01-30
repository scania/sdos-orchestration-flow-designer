import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import { env } from "../../../lib/env";
import { getToken } from "next-auth/jwt";
import axios from "axios";
import { getSDOSOBOToken } from "../../../lib/backend/sdosOBO";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Check the user session
    
    const session = await getServerSession(req, res, authOptions);
    if (!session && env.NODE_ENV === "production") {
      logger.error("Unauthorized request.");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Fetch the OBO token from the session
    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    if (!token) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { access_token } = await getSDOSOBOToken(token);

    logger.debug("Obtained SDOS OBO token:");
    if (!access_token) {
      logger.error("OBO token missing.");
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    
    switch (req.method) {
      case "POST": {
        logger.info(req)
        logger.debug("POST request received.");
        
        try {
          const response = await axios.post(
            `${env.SDOS_ENDPOINT}/sdos/cg/getJsonldContext`,
              
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": 'multipart/form-data',
                Accept: "application/ld+json",
              },
            }
          );
          res.status(200).json(response.data);
        } catch (error: any) {
          logger.debug("Error details:", error);
        }
        break;
      }

      default:
        logger.error("Method not allowed.");
        res.status(405).json({ error: "Method not allowed." });
        break;
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred:", error?.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
