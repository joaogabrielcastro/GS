import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: error.details,
    });
  }

  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Registro já existe',
      field: error.meta?.target,
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro não encontrado',
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
