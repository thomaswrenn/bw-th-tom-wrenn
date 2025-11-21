import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

export default function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const statusCode = typeof err.status === 'number' ? err.status : 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode);
  res.json({ error: { message } });
  next();
}
