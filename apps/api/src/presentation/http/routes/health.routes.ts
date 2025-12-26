import { Router } from "express";

import type { HealthController } from "../controllers/HealthController";

export function createHealthRouter(controller: HealthController): Router {
  const router = Router();
  router.get("/", controller.get);
  return router;
}


