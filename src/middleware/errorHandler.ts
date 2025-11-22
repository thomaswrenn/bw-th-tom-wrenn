import type { Request, Response, NextFunction } from 'express';
import { HTTP500_INTERNAL_SERVER_ERROR } from '../utils/httpStatusCodes.js';

interface AppError extends Error {
  status?: number;
}

export default function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const statusCode = typeof err.status === 'number' ? err.status : HTTP500_INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode);
  res.json({ error: { message } });
  next();
}
