import { z } from 'zod';

export const createBeneficiarySchema = z.object({
  tipo_documento: z.string().optional().nullable(),
  numero_documento: z.string().optional().nullable(),
  nombre_completo: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres'),
  sexo: z.enum(['Mujer', 'Hombre', 'Intersexual', 'No binario', 'Prefiero no responder', 'Otro']).optional().nullable(),
  edad: z.number().int().min(0).max(120).optional().nullable(),
  fecha_nacimiento: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  correo: z.string().email('Correo electrónico inválido').optional().nullable().or(z.literal('')),
  municipio: z.enum(['Apartadó', 'Turbo', 'Necoclí', 'Carepa', 'Chigorodó', 'Mutatá', 'San Juan de Urabá', 'San Pedro de Urabá', 'Arboletes', 'Otro']),
  zona: z.enum(['Urbana', 'Rural']).default('Urbana'),
  direccion: z.string().optional().nullable(),
  nacionalidad: z.string().default('Colombiana'),
  tipo_poblacion: z.enum([
    'Migrante',
    'Refugiado/a o solicitante de asilo',
    'Retornado/a',
    'Comunidad de acogida',
    'Víctima del conflicto',
    'Desplazada',
    'Población vulnerable',
    'Otro'
  ]).optional().nullable(),
  organizacion_responsable: z.enum([
    'COOPI',
    'FADV',
    'HIAS Colombia',
    'Humanity & Inclusion (HI)',
    'Alianza URABÁ-PAÍS'
  ]).default('COOPI'),
  tiene_discapacidad: z.boolean().or(z.number()).default(false),
  tipo_discapacidad: z.string().optional().nullable(),
  autorizacion_datos: z.boolean().or(z.number()).refine(val => Boolean(val) === true, {
    message: 'Es obligatorio el consentimiento para el tratamiento de datos (Habeas Data)'
  }),
  fecha_registro: z.string().optional(),
  
  // Opcional para el flujo integrado: vincular programa y familiares en el mismo registro
  familiares: z.array(z.object({
    nombre_completo: z.string().min(2),
    parentesco: z.string().min(2),
    edad: z.number().optional().nullable(),
    tipo_documento: z.string().optional().nullable(),
    numero_documento: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable()
  })).optional(),
  
  programa_id: z.number().optional().nullable(),
  actividad_inicial: z.object({
    tipo_atencion_ayuda: z.string(),
    descripcion: z.string(),
    responsable: z.string().optional()
  }).optional()
});

export const updateBeneficiarySchema = createBeneficiarySchema.partial().extend({
  autorizacion_datos: z.boolean().or(z.number()).optional()
});

export const searchDuplicateSchema = z.object({
  tipo_documento: z.string().optional(),
  numero_documento: z.string().optional(),
  nombre_completo: z.string().optional(),
  telefono: z.string().optional(),
  fecha_nacimiento: z.string().optional()
});
