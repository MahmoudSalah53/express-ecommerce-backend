import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required").default("7d"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = JSON.stringify(parsed.error.flatten().fieldErrors);
  throw new Error(`Invalid environment variables: ${details}`);
}

export const env = parsed.data;
