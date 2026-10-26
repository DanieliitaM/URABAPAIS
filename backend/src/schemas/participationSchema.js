import { z } from 'zod';

export const createParticipationSchema = z.object({
  beneficiario_id: z.number().int().positive('ID de beneficiario requerido'),
  programa_id: z.number().int().positive('ID de programa requerido'),
  fecha_vinculacion: z.string().optional(),
  estado: z.enum(['Inscrito', 'En proceso', 'Finalizado', 'Retirado']).default('Inscrito'),
  motivo_cambio: z.string().optional().nullable()
});

export const updateParticipationSchema = z.object({
  estado: z.enum(['Inscrito', 'En proceso', 'Finalizado', 'Retirado']),
  motivo_cambio: z.string().optional().nullable()
});
