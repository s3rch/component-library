import mongoose, { Schema } from "mongoose";

export interface UserDoc {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export const UserModel: mongoose.Model<UserDoc> =
  (mongoose.models.User as mongoose.Model<UserDoc> | undefined) ??
  mongoose.model<UserDoc>("User", userSchema);


