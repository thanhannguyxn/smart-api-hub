import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller';
import * as resCtrl from '../controllers/resource.controller';


import { logger } from '../middlewares/logger.middleware';
import { checkTable } from '../middlewares/checkTable.middleware';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';


import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();


router.get('/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));


router.post('/auth/register', validate(registerSchema), authCtrl.register);
router.post('/auth/login', validate(loginSchema), authCtrl.login);



router.use('/:resource', logger, checkTable);


router.get('/:resource', cacheMiddleware, resCtrl.getAll);
router.get('/:resource/:id', cacheMiddleware, resCtrl.getById);


router.post('/:resource', requireAuth, resCtrl.create);
router.put('/:resource/:id', requireAuth, resCtrl.update); 
router.patch('/:resource/:id', requireAuth, resCtrl.update); 


router.delete('/:resource/:id', requireAuth, requireAdmin, resCtrl.remove);

export default router;