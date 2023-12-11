import { Connection } from "stardog";
import { env } from "@/lib/env";
const conn = new Connection({
  username: env.STARDOG_USERNAME,
  password: env.STARDOG_PASSWORD,
  endpoint: env.STARDOG_ENDPOINT,
});

export default conn;
