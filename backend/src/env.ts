import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function isValidUrlList(value: string) {
  const origins = value.split(",").map((origin) => origin.trim()).filter(Boolean);

  if (origins.length === 0) {
    return false;
  }

  return origins.every((origin) => z.string().url().safeParse(origin).success);
}

export function parseBiChatSlugs(value: string) {
  return value
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL obrigatoria.").optional(),
    PORT: z.coerce.number().int().positive().default(3333),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CORS_ORIGIN: z.string().refine(isValidUrlList, "CORS_ORIGIN deve conter uma ou mais URLs validas."),
    DISABLE_DATABASE: z.coerce.boolean().default(false),
    HELENA_ROUTER_URL: z.string().url().optional(),
    HELENA_RELAY_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
    HELENA_SOURCE_DATABASE_URL: z.string().min(1).optional(),
    HELENA_SYNC_ENABLED: z.coerce.boolean().default(false),
    HELENA_SYNC_INTERVAL_MS: z.coerce.number().int().positive().default(120000),
    HELENA_BI_CHAT_SLUGS: z.string().default("").transform(parseBiChatSlugs)
  })
  .superRefine((data, ctx) => {
    if (!data.DISABLE_DATABASE && !data.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL obrigatoria quando DISABLE_DATABASE for false."
      });
    }
  });

export const env = envSchema.parse(process.env);
