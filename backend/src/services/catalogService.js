import { excelStorage } from '../config/db.js';

export class CatalogService {
  static getCatalogs() {
    const store = excelStorage.getStore();

    // Extraer valores únicos presentes en el archivo Excel
    const municipiosEnExcel = [...new Set(store.beneficiarios.map(b => b.municipio).filter(Boolean))];
    const poblacionesEnExcel = [...new Set(store.beneficiarios.map(b => b.tipo_poblacion).filter(Boolean))];
    const organizacionesEnExcel = [...new Set(store.beneficiarios.map(b => b.organizacion_responsable).filter(Boolean))];

    return {
      municipios: municipiosEnExcel.length > 0 ? municipiosEnExcel : ['Apartadó', 'Turbo', 'Necoclí', 'Carepa', 'Chigorodó', 'Mutatá'],
      tipos_documento: [
        'CC/Documento',
        'TI',
        'CE',
        'PEP/PPT',
        'Registro Civil',
        'Sin documento'
      ],
      tipos_poblacion: poblacionesEnExcel.length > 0 ? poblacionesEnExcel : [
        'Migrante',
        'Refugiado/a o solicitante de asilo',
        'Retornado/a',
        'Comunidad de acogida',
        'Víctima del conflicto',
        'Desplazada'
      ],
      zonas: ['Urbana', 'Rural'],
      organizaciones: organizacionesEnExcel.length > 0 ? organizacionesEnExcel : [
        'COOPI',
        'FADV',
        'HIAS Colombia',
        'Humanity & Inclusion (HI)'
      ],
      generos: ['Mujer', 'Hombre', 'Intersexual', 'No binario', 'Prefiero no responder'],
      parentescos: ['Hijo/a', 'Cónyuge/Pareja', 'Madre/Padre', 'Hermano/a', 'Abuelo/a', 'Otro dependiente'],
      estados_participacion: ['Inscrito', 'En proceso', 'Finalizado', 'Retirado'],
      estados_atencion: ['Atendido', 'En proceso', 'Remitido', 'Pendiente'],
      estados_seguimiento: ['En seguimiento', 'Pendiente', 'Atendido', 'Finalizado'],
      lineas_trabajo: [
        { codigo: 'R1', nombre: 'Asistencia humanitaria y protección', lider: 'COOPI' },
        { codigo: 'R2', nombre: 'Salud y bienestar', lider: 'FADV' },
        { codigo: 'R3', nombre: 'Integración socioeconómica y cohesión social', lider: 'HIAS Colombia' }
      ]
    };
  }
}
