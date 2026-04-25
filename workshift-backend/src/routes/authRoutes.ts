import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/authController';
import { validateBody } from '../middleware/validateBody';
import { requireAuth } from '../middleware/authJwt';
import { loginSchema, refreshSchema, registerSchema } from '../validation/authSchemas';
import { loginLimiter, refreshLimiter, registerLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', registerLimiter, validateBody(registerSchema), register);
router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.post('/refresh', refreshLimiter, validateBody(refreshSchema), refresh);
router.post('/logout', requireAuth, logout);

export default router;
