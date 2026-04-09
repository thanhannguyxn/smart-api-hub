import { db } from '../db/knex';

export class ResourceService {
  static async getAll(resource: string, queryParams: any) {
    let query = db(resource);

    
    if (queryParams.q) {
      query = query.whereRaw("CAST(id AS TEXT) ILIKE ?", [`%${queryParams.q}%`]);
    }

    Object.keys(queryParams).forEach(key => {
      if (key.endsWith('_gte')) query = query.where(key.replace('_gte', ''), '>=', queryParams[key]);
      if (key.endsWith('_lte')) query = query.where(key.replace('_lte', ''), '<=', queryParams[key]);
      if (key.endsWith('_ne')) query = query.whereNot(key.replace('_ne', ''), queryParams[key]);
    });

    const page = parseInt(queryParams._page) || 1;
    const limit = parseInt(queryParams._limit) || 10;
    const offset = (page - 1) * limit;

    const [{ count }] = await db(resource).count('* as count'); 
    query = query.limit(limit).offset(offset);

    const data = await query;
    return { data, totalCount: count }; 
  }

  static async create(resource: string, payload: any) {
    const [newItem] = await db(resource).insert(payload).returning('*');
    return newItem;
  }
}