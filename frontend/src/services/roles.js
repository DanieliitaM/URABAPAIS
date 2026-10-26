// Definición centralizada de roles, permisos y restricciones de privacidad (Habeas Data)
// Iniciativa Alianza Humanitaria URABÁ-PAÍS

export const ROLES = {
  ADMIN: {
    id: 'admin',
    name: 'Administrador',
    shortName: 'Administrador',
    tag: 'Acceso Total',
    badgeClass: 'badge-admin',
    headerRole: 'Administrador',
    color: '#8b5cf6',
    initials: 'AD',
    organization: 'Coordinación Alianza (COOPI/FADV/HIAS/HI)',
    description: 'Gestión integral, auditoría, configuración de programas, exportación masiva y supervisión territorial.',
    allowedTabs: ['dashboard', 'beneficiarios', 'nuevo-registro', 'programas', 'atenciones', 'seguimientos', 'portal-publico'],
    permissions: {
      canExportCSV: true,
      canRegisterBeneficiary: true,
      canEditBeneficiary: true,
      canManagePrograms: true,
      canAddFamily: true,
      canEnrollProgram: true,
      canUpdateProgramStatus: true,
      canAddAttention: true,
      canAddFollowup: true,
      canAccessAI: true,
      canViewPrivateData: true,
      isDataMasked: false,
    },
    capabilities: [
      'Visualización y edición completa de todas las fichas',
      'Exportación ejecutiva y analítica de datos en CSV',
      'Configuración y metas de programas humanitarios',
      'Asistente IA ético de síntesis de expedientes',
      'Trazabilidad total de atenciones y seguimientos'
    ],
    restrictions: []
  },

  CAMPO: {
    id: 'campo',
    name: 'Técnico',
    shortName: 'Técnico',
    tag: 'Operativo Territorio',
    badgeClass: 'badge-campo',
    headerRole: 'Técnico',
    color: '#0ea5e9',
    initials: 'TC',
    organization: 'Equipo Operativo (Apartadó / Turbo / Necoclí)',
    description: 'Atención directa en terreno. Búsqueda de personas, verificación de duplicados, registro de beneficiarios, entrega de kits y registro de novedades.',
    allowedTabs: ['dashboard', 'beneficiarios', 'nuevo-registro', 'programas', 'atenciones', 'seguimientos', 'portal-publico'],
    permissions: {
      canExportCSV: false,
      canRegisterBeneficiary: true,
      canEditBeneficiary: true,
      canManagePrograms: false,
      canAddFamily: true,
      canEnrollProgram: true,
      canUpdateProgramStatus: true,
      canAddAttention: true,
      canAddFollowup: true,
      canAccessAI: true,
      canViewPrivateData: true,
      isDataMasked: false,
    },
    capabilities: [
      'Registro paso a paso de nuevos beneficiarios',
      'Control anti-duplicados por documento y nombres',
      'Vinculación de integrantes al núcleo familiar',
      'Registro de entregas de kits, ayudas y atenciones',
      'Consignación de novedades y alertas de seguimiento'
    ],
    restrictions: [
      'Exportación masiva de bases de datos bloqueada (previene fuga de datos personales)',
      'Creación y modificación de metas de programas bloqueada (función de Coordinación)',
      'Eliminación de registros confidenciales restringida'
    ]
  },

  AUDITOR: {
    id: 'auditor',
    name: 'Auditor',
    shortName: 'Auditor',
    tag: 'Solo Lectura & Métricas',
    badgeClass: 'badge-auditor',
    headerRole: 'Auditor',
    color: '#f59e0b',
    initials: 'AU',
    organization: 'Monitoreo de Calidad e Impacto',
    description: 'Auditoría, validación metodológica y análisis de cumplimiento de metas globales. Visualiza datos y exporta reportes sin capacidad de modificar información.',
    allowedTabs: ['dashboard', 'beneficiarios', 'programas', 'atenciones', 'seguimientos', 'portal-publico'], // 'nuevo-registro' bloqueado
    permissions: {
      canExportCSV: true,
      canRegisterBeneficiary: false,
      canEditBeneficiary: false,
      canManagePrograms: false,
      canAddFamily: false,
      canEnrollProgram: false,
      canUpdateProgramStatus: false,
      canAddAttention: false,
      canAddFollowup: false,
      canAccessAI: false,
      canViewPrivateData: true,
      isDataMasked: true,
    },
    capabilities: [
      'Consulta del Tablero de Indicadores y cumplimiento de metas (11.447 personas)',
      'Exportación oficial de reportes consolidados para donantes',
      'Revisión en modo lectura de fichas y atenciones',
      'Auditoría de consistencia de datos de programas'
    ],
    restrictions: [
      'Creación de nuevos beneficiarios bloqueada (modo solo lectura)',
      'Adición o eliminación de familiares deshabilitada',
      'Registro o modificación de atenciones y ayudas bloqueada',
      'Alteración de estados de programas deshabilitada'
    ]
  },

  COMUNIDAD: {
    id: 'comunidad',
    name: 'Consulta Pública',
    shortName: 'Consulta Pública',
    tag: 'Habeas Data Estricto',
    badgeClass: 'badge-comunidad',
    headerRole: 'Consulta Pública',
    color: '#10b981',
    initials: 'CP',
    organization: 'Comunidad de Urabá / Ciudadanía',
    description: 'Acceso público y transparente. Consulta líneas de acción humanitaria, canales de ayuda, puntos de atención y cifras agregadas. Blindaje absoluto de datos personales.',
    allowedTabs: ['portal-publico', 'dashboard'], // Todos los demás módulos bloqueados
    permissions: {
      canExportCSV: false,
      canRegisterBeneficiary: false,
      canEditBeneficiary: false,
      canManagePrograms: false,
      canAddFamily: false,
      canEnrollProgram: false,
      canUpdateProgramStatus: false,
      canAddAttention: false,
      canAddFollowup: false,
      canAccessAI: false,
      canViewPrivateData: false,
      isDataMasked: true,
    },
    capabilities: [
      'Portal Comunitario con rutas de atención y sedes en Apartadó, Turbo y Necoclí',
      'Directorio de contactos humanitarios de COOPI, FADV, HIAS y HI',
      'Consulta de información pública de las 3 líneas de trabajo',
      'Cifras globales agregadas del proyecto sin datos individuales'
    ],
    restrictions: [
      'ACCESO BLOQUEADO a directorio de beneficiarios y nombres (Ley 1581 Habeas Data)',
      'ACCESO BLOQUEADO a expedientes individuales y núcleos familiares',
      'ACCESO BLOQUEADO a registros de atenciones y seguimientos confidenciales',
      'Descarga de datos personales y formularios operativos estrictamente restringidos'
    ]
  }
};

export const ROLE_LIST = [
  ROLES.ADMIN,
  ROLES.CAMPO,
  ROLES.AUDITOR,
  ROLES.COMUNIDAD
];

export function getRoleById(roleId) {
  if (!roleId) return ROLES.ADMIN;
  const match = ROLE_LIST.find(r => r.id === roleId || r.shortName.toLowerCase() === roleId.toLowerCase() || r.headerRole.toLowerCase() === roleId.toLowerCase());
  return match || ROLES.ADMIN;
}

export function isTabAllowed(roleId, tabId) {
  const role = getRoleById(roleId);
  return role.allowedTabs.includes(tabId);
}
