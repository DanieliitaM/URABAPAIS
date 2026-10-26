import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/dashboard', ReportController.getDashboard);
// La exportación de datos detallados requiere permisos de Administrador o Auditor M&E
router.get('/exportar', requireRole(['Administrador', 'Auditor M&E']), ReportController.getExport);

export default router;
