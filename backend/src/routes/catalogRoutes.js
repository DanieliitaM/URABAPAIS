import { Router } from 'express';
import { CatalogController } from '../controllers/catalogController.js';

const router = Router();

router.get('/', CatalogController.getCatalogs);

export default router;
