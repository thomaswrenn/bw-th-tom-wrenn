import type { Request, Response } from 'express';

interface AppError extends Error {
  status?: number;
}

export default function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
): void {
  const statusCode = typeof err.status === 'number' ? err.status : 500;
  const message = err.message || 'Internal Server Error';
  console.error(err);
  res.status(statusCode).json({ error: { message } });
}
