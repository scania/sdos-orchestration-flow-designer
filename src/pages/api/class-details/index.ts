// {
//     "className": "SpecifiedClassName",
//     "relations": [ /* Array of relations specific to the class */ ],
//     "dynamicRelations": [ /* Array of dynamic relations */ ],
//     "ontologyRelations": [ /* Array of ontology-wide relations */ ]
// }

import {
  fetchDynamicRelations,
  fetchOntologyRelations,
  fetchRelations,
} from "@/services/stardogService";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.method === "GET") {
    try {
      const className = req.query.className as string;

      if (!className) {
        // Handle the case where no className is provided
        res
          .status(400)
          .json({ error: "className query parameter is required" });
        return;
      }

      const relations = await fetchRelations(className);
      const dynamicRelations = await fetchDynamicRelations();
      const ontologyRelations = await fetchOntologyRelations(className);

      res.status(200).json({
        className,
        relations,
        dynamicRelations,
        ontologyRelations,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
