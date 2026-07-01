import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

import { env } from "../env.js";

export async function registerCors(app: FastifyInstance) {
  const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origem nao permitida pelo CORS."), false);
    }
  });
}
