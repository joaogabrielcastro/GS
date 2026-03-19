import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { AppError, buildErrorResponse } from "../lib/http";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error("unhandled_http_error", {
    requestId: req.requestId,
    error: error instanceof Error ? error.message : String(error),
    stack: error?.stack,
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      buildErrorResponse({
        req,
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        details: error.details,
      }),
    );
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json(
      buildErrorResponse({
        req,
        statusCode: 400,
        message: "Erro de validação",
        details: error.details,
      }),
    );
  }

  if (error?.code === "P2002") {
    return res.status(409).json(
      buildErrorResponse({
        req,
        statusCode: 409,
        message: "Registro já existe",
        details: { field: error.meta?.target },
      }),
    );
  }

  if (error?.code === "P2025") {
    return res.status(404).json(
      buildErrorResponse({
        req,
        statusCode: 404,
        message: "Registro não encontrado",
      }),
    );
  }

  return res.status(500).json(
    buildErrorResponse({
      req,
      statusCode: 500,
      message: "Erro interno do servidor",
      details:
        process.env.NODE_ENV === "development" ? { stack: error?.stack } : undefined,
    }),
  );
};
