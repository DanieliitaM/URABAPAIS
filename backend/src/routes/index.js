import { Router } from 'express';
import beneficiaryRoutes from './beneficiaryRoutes.js';
import familyRoutes from './familyRoutes.js';
import programRoutes from './programRoutes.js';
import participationRoutes from './participationRoutes.js';
import attentionRoutes from './attentionRoutes.js';
import followupRoutes from './followupRoutes.js';
import reportRoutes from './reportRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import authRoutes from './authRoutes.js';
import { db } from '../config/db.js';

const router = Router();

// Estado general del sistema y base de datos
router.get('/status', (req, res) => {
  res.json({
    proyecto: 'URABÁ-PAÍS',
    version: '1.0.0',
    organizaciones: ['COOPI', 'FADV', 'HIAS Colombia', 'Humanity & Inclusion (HI)'],
    base_de_datos: {
      tipo: 'Archivo Excel (Base_Beneficiarios_Hackathon.xlsx)',
      excel_activo: true,
      estado: 'Operativo 100%'
    },
    servidor_tiempo: new Date().toISOString()
  });
});

// Autenticación independiente por roles
router.use('/auth', authRoutes);

// Módulos
router.use('/catalogos', catalogRoutes);
router.use('/beneficiarios', beneficiaryRoutes);
router.use('/familiares', familyRoutes);
router.use('/programas', programRoutes);
router.use('/participaciones', participationRoutes);
router.use('/atenciones', attentionRoutes);
router.use('/seguimientos', followupRoutes);
router.use('/reportes', reportRoutes);

export default router;
