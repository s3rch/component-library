import mongoose from "mongoose";

import type { User } from "../../../../domain/entities/User";
import type { UserRepository } from "../../../../domain/repositories/UserRepository";
import { AppError } from "../../../../application/errors/AppError";
import { UserModel, type UserDoc } from "../models/UserModel";

function toDomainUser(doc: mongoose.HydratedDocument<UserDoc>): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    passwordHash: doc.passwordHash,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export class MongooseUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).exec();
    return doc ? toDomainUser(doc) : null;
  }

  async create(input: { email: string; passwordHash: string }): Promise<User> {
    try {
      const doc = await UserModel.create({ email: input.email, passwordHash: input.passwordHash });
      return toDomainUser(doc);
    } catch (err: unknown) {
      const code = typeof err === "object" && err !== null && "code" in err ? (err as { code?: unknown }).code : undefined;
      if (code === 11000) {
        throw new AppError({
          statusCode: 409,
          code: "CONFLICT",
          message: "Email already registered"
        });
      }
      throw err;
    }
  }
}


