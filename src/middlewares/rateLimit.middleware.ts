import { Request, Response, NextFunction } from 'express';

const rateLimitMap = new Map<string, { count: number; startTime: number }>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown_ip';
  const now = Date.now();
  const windowMs = 60 * 1000; 
  const maxReq = 100; 

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
  } else {
    const record = rateLimitMap.get(ip)!;
    if (now - record.startTime > windowMs) {
      rateLimitMap.set(ip, { count: 1, startTime: now }); 
    } else {
      record.count += 1;
      if (record.count > maxReq) {
        res.setHeader('X-RateLimit-Limit', maxReq);
        res.setHeader('X-RateLimit-Remaining', 0);
        return next({ statusCode: 429, message: 'Too Many Requests - Bạn đã vượt quá giới hạn truy cập' });
      }
    }
  }
  
  res.setHeader('X-RateLimit-Limit', maxReq);
  res.setHeader('X-RateLimit-Remaining', maxReq - rateLimitMap.get(ip)!.count);
  next();
};