import { Request, Response, NextFunction } from 'express';
import { db } from '../db/knex';

export const checkTable = async (req: Request, res: Response, next: NextFunction) => {
  const { resource } = req.params;
  const exists = await db.schema.hasTable(resource as string);
  if (!exists) return next({ statusCode: 404, message: `Resource '${resource}' không tồn tại` });
  next();
};