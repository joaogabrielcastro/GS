import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { buildErrorResponse } from '../lib/http';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json(
        buildErrorResponse({
          req,
          statusCode: 401,
          message: 'Token não fornecido',
        }),
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(
      buildErrorResponse({
        req,
        statusCode: 401,
        message: 'Token inválido ou expirado',
      }),
    );
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json(
        buildErrorResponse({
          req,
          statusCode: 403,
          message: 'Acesso negado',
        }),
      );
    }

    next();
  };
};
