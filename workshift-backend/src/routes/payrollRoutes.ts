import { Router } from 'express';
import { getPayroll } from '../controllers/payrollController';
import { requireAuth } from '../middleware/authJwt';
import { validateQuery } from '../middleware/validateQuery';
import { payrollQuerySchema } from '../validation/payrollSchemas';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, validateQuery(payrollQuerySchema), getPayroll);

export default router;
