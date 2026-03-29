import { Router } from 'express';
import { apiOk } from '../common/apiResponse';
import { requireAuth } from '../middleware/authJwt';

const router = Router();

router.get('/my-groups', requireAuth, (_req, res) => {
  res.json(apiOk('OK', []));
});

export default router;
