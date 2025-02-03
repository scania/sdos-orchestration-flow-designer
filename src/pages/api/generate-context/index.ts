import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import logger from "../../../lib/logger";
import { env } from "../../../lib/env";
import { getToken } from "next-auth/jwt";
import axios from "axios";
import fs from "fs"; // Use 'fs' instead of 'fs/promises'
import FormData from "form-data"; // Ensure form-data is imported
import * as formidable from "formidable";
import { getSDOSOBOToken } from "../../../lib/backend/sdosOBO";

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser for multipart/form-data
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Check the user session
    const session = await getServerSession(req, res, authOptions);
    if (!session && env.NODE_ENV === "production") {
      logger.error("Unauthorized request.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch the OBO token from the session
    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    if (!token) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { access_token } = await getSDOSOBOToken(token);

    logger.debug("Obtained SDOS OBO token:");
    if (!access_token) {
      logger.error("OBO token missing.");
      return res.status(403).json({ error: "Forbidden" });
    }

    switch (req.method) {
      case "POST": {
        const form = new formidable.IncomingForm();

        // Await formidable parsing using a Promise
        const { files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
          });
        });

        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file || !file.filepath) {
          return res.status(400).json({ error: "Invalid file upload" });
        }

        // Create a FormData instance and append the file
        const formData = new FormData();
        formData.append("file", fs.createReadStream(file.filepath));

        try {
          const response = await axios.post(
            `https://sdos.sdip.devtest.aws.scania.com/sdos/cg/getJsonldContext`, 
            formData,  // Send the form data
            {
              headers: {
                ...formData.getHeaders(),  // Automatically adds correct headers for FormData
                Authorization: `Bearer ${access_token}`,
              },
            }
          );
          return res.status(200).json({ message: "File uploaded", data: response.data });
        } catch (error) {
          logger.error("Error uploading to external API:", {
            message: error,
            response: error.response?.data, // API response (if any)
            status: error.response?.status, // HTTP status
            stack: error.stack, // Stack trace
          });
          return res.status(500).json({ error: "Upload failed" });
        }
      }

      default:
        logger.error("Method not allowed.");
        return res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred:", error);
    return res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};
