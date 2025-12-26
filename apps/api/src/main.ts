import dotenv from "dotenv";
import { createApp, initDatabase } from "./app";
import { getEnv } from "./config/env";
import { logger } from "./infrastructure/logging/logger";

dotenv.config();

async function bootstrap(): Promise<void> {
  const env = getEnv();
  await initDatabase(env.mongoUri);

  const app = createApp({ jwtSecret: env.jwtSecret });
  app.listen(env.port, () => {
    logger.info(`[api] listening on port ${env.port}`);
  });
}

bootstrap().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error("[api] failed to start", { message });
  process.exit(1);
});


