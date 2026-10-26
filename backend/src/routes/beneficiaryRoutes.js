import { Router } from 'express';
import { BeneficiaryController } from '../controllers/beneficiaryController.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

// Consultas de beneficiarios (Bloqueado para 'Comunidad' por Habeas Data)
router.get('/buscar-duplicados', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), BeneficiaryController.checkDuplicates);
router.get('/', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), BeneficiaryController.getAll);
router.get('/:id', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), BeneficiaryController.getById);
router.get('/:id/ficha-consolidada', requireRole(['Administrador', 'Técnico de Campo', 'Auditor M&E']), BeneficiaryController.getConsolidatedFile);
router.get('/:id/resumen-ia', requireRole(['Administrador', 'Técnico de Campo']), BeneficiaryController.getAiSummary);

// Creación y actualización (Solo personal operativo y admin, bloqueado para Auditor y Comunidad)
router.post('/', requireRole(['Administrador', 'Técnico de Campo']), BeneficiaryController.create);
router.put('/:id', requireRole(['Administrador', 'Técnico de Campo']), BeneficiaryController.update);

export default router;
