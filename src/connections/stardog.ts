import { Connection } from "stardog";
const conn = new Connection({
  username: process.env.STARDOG_USERNAME || "",
  password: process.env.STARDOG_PASSWORD || "",
  endpoint: process.env.STARDOG_ENDPOINT || "",
});

export default conn;
