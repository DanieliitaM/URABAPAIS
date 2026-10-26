import { Router } from 'express';
import { ProgramController } from '../controllers/programController.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', ProgramController.getAll);
router.get('/:id', ProgramController.getById);
// La creación y modificación de programas está reservada a la Coordinación General
router.post('/', requireRole(['Administrador']), ProgramController.create);

export default router;
