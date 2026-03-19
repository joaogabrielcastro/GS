import { Request } from "express";

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR";

export type ErrorDetails = unknown;

export class AppError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: ErrorDetails;

  constructor(
    message: string,
    statusCode: number,
    code?: ErrorCode,
    details?: ErrorDetails,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? mapStatusToCode(statusCode);
    this.details = details;
  }
}

export function mapStatusToCode(statusCode: number): ErrorCode {
  if (statusCode === 400) return "BAD_REQUEST";
  if (statusCode === 401) return "UNAUTHORIZED";
  if (statusCode === 403) return "FORBIDDEN";
  if (statusCode === 404) return "NOT_FOUND";
  if (statusCode === 409) return "CONFLICT";
  if (statusCode === 422) return "UNPROCESSABLE_ENTITY";
  if (statusCode === 429) return "TOO_MANY_REQUESTS";
  return "INTERNAL_SERVER_ERROR";
}

export function buildErrorResponse(params: {
  req: Request;
  statusCode: number;
  message: string;
  code?: ErrorCode;
  details?: ErrorDetails;
}) {
  const { req, statusCode, message, code, details } = params;

  return {
    success: false,
    error: {
      code: code ?? mapStatusToCode(statusCode),
      message,
      ...(details !== undefined ? { details } : {}),
    },
    requestId: req.requestId,
  };
}
