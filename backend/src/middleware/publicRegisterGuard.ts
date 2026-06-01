import { Request, Response, NextFunction } from "express";
import { buildErrorResponse } from "../lib/http";

function isPublicRegisterAllowed(): boolean {
  const raw = process.env.ALLOW_PUBLIC_REGISTER?.trim().toLowerCase();
  return raw === "true" || raw === "1";
}

export function publicRegisterGuard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (isPublicRegisterAllowed()) {
    return next();
  }
  return res.status(403).json(
    buildErrorResponse({
      req,
      statusCode: 403,
      message:
        "Cadastro público desativado. Solicite ao administrador a criação da sua conta.",
    }),
  );
}
