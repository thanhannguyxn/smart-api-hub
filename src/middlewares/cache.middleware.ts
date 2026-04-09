import { Request, Response, NextFunction } from 'express';

const cache = new Map<string, { data: any; expiry: number }>();

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { resource } = req.params;
  
  
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    for (const key of cache.keys()) {
      if (key.includes(`/${resource}`)) cache.delete(key);
    }
    return next();
  }

  
  if (req.method === 'GET') {
    const key = req.originalUrl;
    const cachedItem = cache.get(key);
    
    
    if (cachedItem && cachedItem.expiry > Date.now()) {
      console.log(`⚡ Phản hồi từ Cache: ${key}`);
      return res.status(200).json(cachedItem.data);
    }

    
    const originalJson = res.json.bind(res);
    res.json = ((body: any) => {
      
      cache.set(key, { data: body, expiry: Date.now() + 30000 });
      return originalJson(body);
    }) as any;
  }
  next();
};