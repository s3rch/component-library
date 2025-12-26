import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required")
});

export interface Env {
  port: number;
  mongoUri: string;
  jwtSecret: string;
}

export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`[env] Invalid environment variables:\n${details}`);
  }

  const portStr = parsed.data.PORT;
  const port = portStr ? Number(portStr) : 4000;
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`[env] Invalid PORT value: "${portStr ?? ""}"`);
  }

  return {
    port,
    mongoUri: parsed.data.MONGODB_URI,
    jwtSecret: parsed.data.JWT_SECRET
  };
}


