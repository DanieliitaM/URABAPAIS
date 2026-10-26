import { z } from 'zod';

export const createFamilyMemberSchema = z.object({
  beneficiario_id: z.number().int().positive('ID de beneficiario requerido'),
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  parentesco: z.string().min(2, 'Parentesco requerido (Hijo/a, Cónyuge, etc.)'),
  edad: z.number().int().min(0).max(120).optional().nullable(),
  tipo_documento: z.string().optional().nullable(),
  numero_documento: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable()
});

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial();
