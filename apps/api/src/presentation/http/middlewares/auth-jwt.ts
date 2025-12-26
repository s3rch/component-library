import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../../application/errors/AppError";
import type { JwtProvider } from "../../../application/ports";

export interface AuthContext {
  userId: string;
  email: string;
}

export function createAuthJwtMiddleware(jwtProvider: JwtProvider) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.header("authorization");
    if (!header) {
      return next(new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing token" }));
    }

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return next(
        new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Invalid authorization header" })
      );
    }

    const payload = jwtProvider.verify(token);
    res.locals.auth = { userId: payload.sub, email: payload.email } satisfies AuthContext;
    return next();
  };
}


