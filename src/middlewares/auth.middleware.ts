import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request { user?: any; }

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next({ statusCode: 401, message: 'Vui lòng cung cấp Bearer Token hợp lệ' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (err) {
    next({ statusCode: 401, message: 'Token đã hết hạn hoặc không hợp lệ' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return next({ statusCode: 403, message: 'Truy cập bị từ chối: Yêu cầu quyền Admin' });
  }
  next();
};