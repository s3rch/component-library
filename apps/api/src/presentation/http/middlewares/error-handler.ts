import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../../../application/errors/AppError";
import { logger } from "../../../infrastructure/logging/logger";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function errorHandler(err: unknown, _req: Request, res: Response<ErrorResponse>, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(typeof err.details !== "undefined" ? { details: err.details } : {})
      }
    });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: err.flatten()
      }
    });
  }

  const message = err instanceof Error ? err.message : String(err);
  logger.error("[api] unhandled error", { message });

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error"
    }
  });
}


