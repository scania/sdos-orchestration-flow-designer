import { fetchAllSHACLShapes } from "@/services/stardogService";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import * as URI from "uri-js";

interface Triple {
  subject: string;
  predicate: string;
  object: string | number | Record<string, unknown>;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    logger.info("ofd SHACL request received.");
    logger.debug("Request details:", { method: req.method, url: req.url });
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      logger.error("Unauthorized request.");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    switch (req.method) {
      case "GET":
        const response = await fetchAllSHACLShapes();
        logger.info("Fetched SAHCL Shapes successfully.");

        // Iterate through SPARQL results and add triples to the store
        let triples: Triple[] = [];
        response.forEach((result: any) => {
          const triple: Triple = {
            subject: result.subject.value,
            predicate: result.predicate.value,
            object: result.object.value,
          };

          // Add the triple to the array
          triples.push(triple);
        });

        // Filter out triples with invalid URIs and sort the remaining triples by subject
        const validUriTriples = triples.filter((triple) => {
          const parsedUri = URI.parse(triple.subject);
          return parsedUri.scheme === "http" || parsedUri.scheme === "https";
        });
        validUriTriples.sort((a, b) => a.subject.localeCompare(b.subject));

        //console.log(validUriTriples);
        // Sort the triples array by subject
        triples.sort((a, b) => a.subject.localeCompare(b.subject));
        console.log(triples);

        res.status(200).json(validUriTriples);
        break;

      default:
        logger.error("Method not allowed.");
        res.status(405).json({ error: "Method not allowed." });
        break;
    }
  } catch (error) {
    console.log(error);

    logger.error("An error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
