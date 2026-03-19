import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { buildErrorResponse } from "../lib/http";

type ValidationSchemas = {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
};

function toFieldErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body) as any;
      if (schemas.query) req.query = schemas.query.parse(req.query) as any;
      if (schemas.params) req.params = schemas.params.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          ...buildErrorResponse({
            req,
            statusCode: 400,
            message: "Dados inválidos",
            details: toFieldErrors(error),
          }),
        });
      }
      return res.status(400).json(
        buildErrorResponse({
          req,
          statusCode: 400,
          message: "Requisição inválida",
        }),
      );
    }
  };
}
