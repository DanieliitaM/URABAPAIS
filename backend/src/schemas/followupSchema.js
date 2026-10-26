import { z } from 'zod';

export const createFollowupSchema = z.object({
  beneficiario_id: z.number().int().positive('ID de beneficiario requerido'),
  fecha_seguimiento: z.string().min(10, 'Fecha de seguimiento requerida (YYYY-MM-DD)'),
  avance_novedad: z.string().min(3, 'Avance o novedad requerida'),
  observacion: z.string().optional().nullable(),
  estado_caso: z.enum(['En seguimiento', 'Atendido', 'Pendiente', 'Finalizado']).default('En seguimiento'),
  accion_pendiente: z.string().min(3, 'Acción pendiente o próximo paso requerida'),
  proximo_contacto: z.string().optional().nullable(),
  responsable: z.string().optional().nullable()
});

export const updateFollowupSchema = createFollowupSchema.partial();
