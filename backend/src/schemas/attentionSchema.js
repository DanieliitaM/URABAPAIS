import { z } from 'zod';

export const createAttentionSchema = z.object({
  beneficiario_id: z.number().int().positive('ID de beneficiario requerido'),
  programa_id: z.number().int().positive().optional().nullable(),
  fecha_atencion: z.string().min(10, 'Fecha de atención requerida (YYYY-MM-DD)'),
  tipo_atencion_ayuda: z.enum([
    'Ayuda',
    'Atención',
    'Orientación',
    'Kit higiénico',
    'Kit de dignidad',
    'Kit alimentario',
    'Kit para bebés',
    'Salud física',
    'Salud mental / Psicosocial',
    'Salud sexual y reproductiva',
    'Asesoría jurídica',
    'Formación / Capacitación',
    'Fondo de emergencia',
    'Remisión',
    'Otro'
  ]),
  actividad_recibida: z.string().optional().nullable(),
  resultado_asociado: z.enum(['R1', 'R2', 'R3', 'General']).optional().nullable(),
  descripcion: z.string().min(3, 'Descripción de la atención o ayuda requerida'),
  organizacion: z.enum([
    'COOPI',
    'FADV',
    'HIAS Colombia',
    'Humanity & Inclusion (HI)',
    'Entidad Externa'
  ]).default('COOPI'),
  responsable: z.string().optional().nullable(),
  resultado: z.enum(['Entregado', 'Atendido', 'En proceso', 'Finalizado', 'Pendiente', 'Remitido']).default('Atendido'),
  remitido_a: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable()
});

export const updateAttentionSchema = createAttentionSchema.partial();
