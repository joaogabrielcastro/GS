import { NextFunction, Request, Response } from "express";

function isWrappedSuccess(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const payload = body as Record<string, unknown>;
  return payload.success === true && "data" in payload && "requestId" in payload;
}

export function successResponseWrapper(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const originalJson = res.json.bind(res);

  res.json = ((body: unknown) => {
    if (!req.originalUrl.startsWith("/api")) return originalJson(body);
    if (res.statusCode >= 400) return originalJson(body);
    if (isWrappedSuccess(body)) return originalJson(body);

    return originalJson({
      success: true,
      data: body,
      requestId: req.requestId,
    });
  }) as Response["json"];

  next();
}
