import type { RequestHandler } from "express";
import { Router } from "express";
import { z } from "zod";

import type { ComponentsController } from "../controllers/ComponentsController";
import { validateBody, validateQuery } from "../middlewares/validate";

const trackSchema = z.object({
  component: z.string().min(1),
  variant: z.string().min(1),
  action: z.string().min(1),
  metadata: z.record(z.unknown()).optional()
});

const exportQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(10000).optional()
});

export function createComponentsRouter(
  controller: ComponentsController,
  requireJwt: RequestHandler
): Router {
  const router = Router();
  router.post("/track", validateBody(trackSchema), controller.track);
  router.get("/stats", controller.stats);
  router.get("/export", requireJwt, validateQuery(exportQuerySchema), controller.exportCsv);
  return router;
}


