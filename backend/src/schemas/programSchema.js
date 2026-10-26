import { z } from 'zod';

export const createProgramSchema = z.object({
  codigo: z.string().min(2, 'Código de programa requerido (ej. R1, R2, R3)'),
  nombre: z.string().min(3, 'Nombre del programa requerido'),
  linea_trabajo: z.enum([
    'Asistencia humanitaria y protección',
    'Salud y bienestar',
    'Integración socioeconómica y cohesión social',
    'Otra'
  ]),
  meta_estimada: z.number().int().min(0).default(0),
  organizacion_lider: z.string().min(2, 'Organización líder requerida'),
  descripcion: z.string().optional().nullable(),
  activo: z.boolean().or(z.number()).default(true)
});

export const updateProgramSchema = createProgramSchema.partial();
