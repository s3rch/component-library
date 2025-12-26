import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../../../application/errors/AppError";

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError({
          statusCode: 400,
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: parsed.error.flatten()
        })
      );
    }

    (req as unknown as { body: T }).body = parsed.data;
    return next();
  };
}

export function validateQuery<T>(schema: z.ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new AppError({
          statusCode: 400,
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: parsed.error.flatten()
        })
      );
    }

    (req as unknown as { query: T }).query = parsed.data;
    return next();
  };
}


