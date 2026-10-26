import { Router } from 'express';
import { ParticipationController } from '../controllers/participationController.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/beneficiario/:beneficiaryId', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), ParticipationController.getByBeneficiary);
router.post('/vincular', requireRole(['Administrador', 'Técnico de Campo']), ParticipationController.enroll);
router.patch('/:id/estado', requireRole(['Administrador', 'Técnico de Campo']), ParticipationController.updateStatus);

export default router;
