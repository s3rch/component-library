import jwt, { type SignOptions } from "jsonwebtoken";

import { AppError } from "../../../application/errors/AppError";
import type { JwtPayload, JwtProvider } from "../../../application/ports";

export class JsonWebTokenProvider implements JwtProvider {
  constructor(private readonly secret: string) {}

  sign(payload: JwtPayload, options?: { expiresIn: string }): string {
    const expiresIn = options?.expiresIn;
    if (typeof expiresIn === "string") {
      const signOptions: SignOptions = {
        expiresIn: expiresIn as Exclude<SignOptions["expiresIn"], undefined>
      };
      return jwt.sign(payload, this.secret, signOptions);
    }
    return jwt.sign(payload, this.secret);
  }

  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (typeof decoded !== "object" || decoded === null) {
        throw new Error("Invalid token payload");
      }

      const maybe = decoded as Partial<JwtPayload>;
      if (typeof maybe.sub !== "string" || typeof maybe.email !== "string") {
        throw new Error("Invalid token payload");
      }

      return { sub: maybe.sub, email: maybe.email };
    } catch {
      throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Invalid token" });
    }
  }
}


