export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(args: { statusCode: number; code: ErrorCode; message: string; details?: unknown }) {
    super(args.message);
    this.name = "AppError";
    this.statusCode = args.statusCode;
    this.code = args.code;
    this.details = args.details;
  }
}


