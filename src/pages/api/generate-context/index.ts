import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import * as formidable from "formidable";

import { withAuth, AuthContext } from "@/lib/backend/withAuth";
import { env } from "../../../lib/env";
import logger from "../../../lib/logger";
import { getSDOSOBOToken } from "../../../lib/backend/sdosOBO";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: AuthContext
) {
  try {
    const access_token = ctx.tokens.sdosOBO;

    switch (req.method) {
      case "POST": {
        const form = new formidable.IncomingForm({
          allowEmptyFiles: true,
          minFileSize: 0,
        });
        const { files } = await new Promise<{
          fields: formidable.Fields;
          files: formidable.Files;
        }>((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
          });
        });

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file || !file.filepath) {
          return res.status(400).json({ error: "Invalid file upload" });
        }

        const formData = new FormData();
        formData.append(
          "file",
          fs.createReadStream(file.filepath),
          file.originalFilename
        );

        try {
          const response = await axios.post(
            `${env.SDOS_ENDPOINT}/sdos/cg/getJsonldContext`,
            formData,
            {
              headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${access_token}`,
              },
            }
          );
          return res
            .status(200)
            .json({ message: "File uploaded", data: response.data });
        } catch (error: any) {
          const status = error.response?.status || 500;
          const errorData = error.response?.data || {};
          return res.status(status).json({
            message: error.message,
            status,
            sdipErrorCodes: errorData.sdipErrorCodes || [],
            messages: errorData.messages || ["An unknown error occurred"],
          });
        }
      }

      default:
        logger.error("Method not allowed.");
        return res.status(405).json({ error: "Method not allowed." });
    }
  } catch (error: any) {
    logger.error("An unexpected error occurred:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Internal Server Error" });
  }
}

export default withAuth({ sdosOBO: getSDOSOBOToken })(handler);
