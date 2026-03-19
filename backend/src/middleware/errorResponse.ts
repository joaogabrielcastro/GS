import { NextFunction, Request, Response } from "express";
import { buildErrorResponse, mapStatusToCode } from "../lib/http";

function hasStandardErrorFormat(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const asObj = body as Record<string, unknown>;
  return (
    asObj.success === false &&
    typeof asObj.requestId === "string" &&
    typeof asObj.error === "object" &&
    asObj.error !== null
  );
}

export function errorResponseNormalizer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const originalJson = res.json.bind(res);

  res.json = ((body: unknown) => {
    const statusCode = res.statusCode;
    if (statusCode < 400 || hasStandardErrorFormat(body)) {
      return originalJson(body);
    }

    let message = "Erro interno do servidor";
    let details: unknown;

    if (typeof body === "string") {
      message = body;
    } else if (body && typeof body === "object") {
      const asObj = body as Record<string, unknown>;
      if (typeof asObj.error === "string") {
        message = asObj.error;
      } else if (typeof asObj.message === "string") {
        message = asObj.message;
      }
      if (asObj.details !== undefined) {
        details = asObj.details;
      }
    }

    return originalJson(
      buildErrorResponse({
        req,
        statusCode,
        code: mapStatusToCode(statusCode),
        message,
        details,
      }),
    );
  }) as Response["json"];

  next();
}
