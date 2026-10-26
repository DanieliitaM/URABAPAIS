import { Router } from 'express';
import { AttentionController } from '../controllers/attentionController.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), AttentionController.getAll);
router.get('/beneficiario/:beneficiaryId', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), AttentionController.getByBeneficiary);
router.post('/', requireRole(['Administrador', 'Técnico de Campo']), AttentionController.create);

export default router;
