import { env } from "../../env.js";
import { FakeHelenaSource } from "./fake-helena-source.js";
import { PgHelenaSource } from "./helena-source.js";
import type { HelenaSourceClient } from "./helena-source.types.js";

export function createHelenaSource(): HelenaSourceClient {
  if (env.HELENA_SOURCE_DATABASE_URL) {
    return new PgHelenaSource(env.HELENA_SOURCE_DATABASE_URL);
  }
  return new FakeHelenaSource([]);
}
