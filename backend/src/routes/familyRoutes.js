import { Router } from 'express';
import { FamilyController } from '../controllers/familyController.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/beneficiario/:beneficiaryId', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), FamilyController.getByBeneficiary);
router.post('/', requireRole(['Administrador', 'Técnico de Campo']), FamilyController.create);
router.delete('/:id', requireRole(['Administrador']), FamilyController.delete);

export default router;
