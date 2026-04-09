import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape } from 'zod';

export const validate = (schema: ZodObject<ZodRawShape>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error: any) {
    next({ statusCode: 400, message: "Dữ liệu đầu vào không đúng định dạng", details: error.errors });
  }
};