import { env } from "./env";
import pino from "pino";

const logger = pino({
  level: env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export default logger;
