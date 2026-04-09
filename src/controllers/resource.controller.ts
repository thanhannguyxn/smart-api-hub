import { Request, Response } from 'express';
import { db } from '../db/knex';
import { catchAsync } from '../utils/catchAsync';

export const getAll = catchAsync(async (req: Request, res: Response) => {
  const resource = req.params.resource as string;
  let query = db(resource);

  
  if (req.query._fields) {
    query = query.select((req.query._fields as string).split(','));
  }

  
  if (req.query.q) {
    query = query.whereRaw("CAST(id AS TEXT) ILIKE ?", [`%${req.query.q}%`]);
  }

  
  Object.keys(req.query).forEach(key => {
    const val = req.query[key] as string;
    if (key.endsWith('_gte')) query = query.where(key.replace('_gte', ''), '>=', val);
    else if (key.endsWith('_lte')) query = query.where(key.replace('_lte', ''), '<=', val);
    else if (key.endsWith('_ne')) query = query.whereNot(key.replace('_ne', ''), val);
    else if (key.endsWith('_like')) query = query.where(key.replace('_like', ''), 'ILIKE', `%${val}%`);
    else if (!key.startsWith('_') && key !== 'q') query = query.where(key, val);
  });

  
  if (req.query._sort) {
    const order = (req.query._order as string) === 'desc' ? 'desc' : 'asc';
    query = query.orderBy(req.query._sort as string, order);
  }

  
  const page = parseInt(req.query._page as string) || 1;
  const limit = parseInt(req.query._limit as string) || 10;
  const offset = (page - 1) * limit;

  const countQuery = query.clone().clearSelect().clearOrder().count('* as count').first();
  const countResult = await countQuery as any;
  const totalCount = countResult?.count || 0;
  
  query = query.limit(limit).offset(offset);
  let data: any[] = await query;

  

  
  if (req.query._expand) {
    const parentTable = req.query._expand as string;
    if (await db.schema.hasTable(parentTable)) {
      const fk = parentTable.replace(/s$/, '') + '_id'; 
      const parentIds = [...new Set(data.map(item => item[fk]).filter(Boolean))];
      
      if (parentIds.length > 0) {
        const parents = await db(parentTable).whereIn('id', parentIds);
        data = data.map(item => ({
          ...item,
          [parentTable.replace(/s$/, '')]: parents.find(p => p.id === item[fk]) || null
        }));
      }
    }
  }

  if (req.query._embed) {
    const childTable = req.query._embed as string;
    if (await db.schema.hasTable(childTable)) {
      const fk = resource.replace(/s$/, '') + '_id'; 
      const parentIds = data.map(item => item.id);

      if (parentIds.length > 0) {
        const children = await db(childTable).whereIn(fk, parentIds);
        data = data.map(item => ({
          ...item,
          [childTable]: children.filter(c => c[fk] === item.id)
        }));
      }
    }
  }

  res.setHeader('X-Total-Count', totalCount.toString());
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
  res.status(200).json({ success: true, data });
});


export const getById = catchAsync(async (req: Request, res: Response) => {
    const resource = req.params.resource as string;
    const item = await db(resource).where({ id: req.params.id }).first();
    if (!item) throw { statusCode: 404, message: 'Dữ liệu không tồn tại' };
    res.status(200).json({ success: true, data: item });
});

export const create = catchAsync(async (req: Request, res: Response) => {
    const resource = req.params.resource as string;
    const [newItem] = await db(resource).insert(req.body).returning('*');
    res.status(201).json({ success: true, data: newItem });
});

export const update = catchAsync(async (req: Request, res: Response) => {
    const resource = req.params.resource as string;
    const [updatedItem] = await db(resource).where({ id: req.params.id }).update({...req.body, updated_at: new Date()}).returning('*');
    if (!updatedItem) throw { statusCode: 404, message: 'Không tìm thấy dữ liệu' };
    res.status(200).json({ success: true, data: updatedItem });
});

export const remove = catchAsync(async (req: Request, res: Response) => {
    const resource = req.params.resource as string;
    const deletedCount = await db(resource).where({ id: req.params.id }).del();
    if (deletedCount === 0) throw { statusCode: 404, message: 'Không tìm thấy dữ liệu' };
    res.status(204).send();
});