import type { NextApiResponse } from "next";
import axios, { AxiosError } from "axios";
import logger from "@/lib/logger";

export function respondApiError(
  err: unknown,
  res: NextApiResponse,
  defaultMessage = "Unexpected error"
): void {
  if (axios.isAxiosError(err)) {
    const axErr = err as AxiosError<any>;

    const execId = axErr.response?.headers?.["executionid"];
    if (execId) res.setHeader("Execution-Id", execId);

    const status = axErr.response?.status ?? 500;
    const data = axErr.response?.data;

    let message = defaultMessage;
    if (typeof data === "string") {
      message = data;
    } else if (data && typeof data === "object") {
      if (Array.isArray(data.messages) && data.messages.length) {
        message = data.messages.join(" ");
      } else {
        message = data.error ?? data.message ?? defaultMessage;
      }
    }
    logger.warn(message, { status, data });
    return res.status(status).json({ error: message });
  }

  const fallback =
    err instanceof Error ? err.message : JSON.stringify(err, null, 2);
  logger.warn("Non-Axios error:", fallback);
  res.status(500).json({ error: defaultMessage });
}
