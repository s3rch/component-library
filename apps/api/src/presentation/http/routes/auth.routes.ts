import { Router } from "express";
import { z } from "zod";

import type { AuthController } from "../controllers/AuthController";
import { validateBody } from "../middlewares/validate";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();
  router.post("/register", validateBody(registerSchema), controller.register);
  router.post("/login", validateBody(loginSchema), controller.login);
  return router;
}


