import cors from "cors";
import express from "express";
import morgan from "morgan";

import { LoginUserUseCase } from "./application/use-cases/LoginUserUseCase";
import { RegisterUserUseCase } from "./application/use-cases/RegisterUserUseCase";
import { ExportEventsUseCase } from "./application/use-cases/ExportEventsUseCase";
import { GetStatsUseCase } from "./application/use-cases/GetStatsUseCase";
import { TrackEventUseCase } from "./application/use-cases/TrackEventUseCase";
import { BcryptPasswordHasher } from "./infrastructure/crypto/BcryptPasswordHasher";
import { JsonWebTokenProvider } from "./infrastructure/auth/jwt/JsonWebTokenProvider";
import { connectMongo } from "./infrastructure/db/mongoose/connection";
import { MongooseTrackingEventRepository } from "./infrastructure/db/mongoose/repositories/MongooseTrackingEventRepository";
import { MongooseUserRepository } from "./infrastructure/db/mongoose/repositories/MongooseUserRepository";
import { logger } from "./infrastructure/logging/logger";
import { AuthController } from "./presentation/http/controllers/AuthController";
import { ComponentsController } from "./presentation/http/controllers/ComponentsController";
import { HealthController } from "./presentation/http/controllers/HealthController";
import { createAuthJwtMiddleware } from "./presentation/http/middlewares/auth-jwt";
import { errorHandler } from "./presentation/http/middlewares/error-handler";
import { notFoundHandler } from "./presentation/http/middlewares/not-found";
import { createAuthRouter } from "./presentation/http/routes/auth.routes";
import { createComponentsRouter } from "./presentation/http/routes/components.routes";
import { createHealthRouter } from "./presentation/http/routes/health.routes";

export interface CreateAppOptions {
  jwtSecret: string;
}

export async function initDatabase(mongoUri: string): Promise<void> {
  await connectMongo(mongoUri);
}

export function createApp(options: CreateAppOptions): express.Express {
  const app = express();
  app.disable("x-powered-by");

  app.use(cors());
  app.use(express.json({ limit: "256kb" }));

  app.use(
    morgan("tiny", {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    })
  );

  const userRepository = new MongooseUserRepository();
  const trackingEventRepository = new MongooseTrackingEventRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const jwtProvider = new JsonWebTokenProvider(options.jwtSecret);

  const registerUser = new RegisterUserUseCase(userRepository, passwordHasher);
  const loginUser = new LoginUserUseCase(userRepository, passwordHasher, jwtProvider);
  const trackEvent = new TrackEventUseCase(trackingEventRepository);
  const getStats = new GetStatsUseCase(trackingEventRepository);
  const exportEvents = new ExportEventsUseCase(trackingEventRepository);

  const authController = new AuthController(registerUser, loginUser);
  const componentsController = new ComponentsController(trackEvent, getStats, exportEvents);
  const healthController = new HealthController();

  const requireJwt = createAuthJwtMiddleware(jwtProvider);

  app.use("/api/health", createHealthRouter(healthController));
  app.use("/api/auth", createAuthRouter(authController));
  app.use("/api/components", createComponentsRouter(componentsController, requireJwt));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}


