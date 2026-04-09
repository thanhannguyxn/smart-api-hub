import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Lỗi:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    details: err.details || null
  });
};