import { Router } from 'express';
import {
  createRequirement,
  deleteRequirement,
  listRequirements,
  updateRequirement,
} from '../controllers/shiftRequirementController';
import { requireAuth } from '../middleware/authJwt';
import { validateBody } from '../middleware/validateBody';
import { upsertShiftRequirementSchema } from '../validation/shiftSchemas';

const router = Router({ mergeParams: true });

router.post('/', requireAuth, validateBody(upsertShiftRequirementSchema), createRequirement);
router.get('/', requireAuth, listRequirements);
router.patch('/:requirementId', requireAuth, validateBody(upsertShiftRequirementSchema), updateRequirement);
router.delete('/:requirementId', requireAuth, deleteRequirement);

export default router;
