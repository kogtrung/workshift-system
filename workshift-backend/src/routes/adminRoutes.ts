import { Router } from 'express';
import { apiOk } from '../common/apiResponse';
import { requireAuth, requireAdmin } from '../middleware/authJwt';

const router = Router();

router.get('/ping', requireAuth, requireAdmin, (_req, res) => {
  res.json(apiOk('pong', 'ADMIN connection successful'));
});

export default router;
