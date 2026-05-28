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

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL obrigatoria.").optional(),
    PORT: z.coerce.number().int().positive().default(3333),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CORS_ORIGIN: z.string().refine(isValidUrlList, "CORS_ORIGIN deve conter uma ou mais URLs validas."),
    DISABLE_DATABASE: z.coerce.boolean().default(false)
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
