import { Router } from 'express';
import { FollowupController } from '../controllers/followupController.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), FollowupController.getAll);
router.get('/beneficiario/:beneficiaryId', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), FollowupController.getByBeneficiary);
router.post('/', requireRole(['Administrador', 'Técnico de Campo']), FollowupController.create);
router.put('/:id', requireRole(['Administrador', 'Técnico de Campo']), FollowupController.update);

export default router;
