// Middleware para validación y respeto de roles y restricciones de privacidad (Habeas Data)
// Roles soportados:
// - Administrador (Acceso total)
// - Técnico de Campo (Operación territorial, sin exportación masiva ni edición de programas)
// - Auditor M&E (Solo lectura y auditoría analítica, sin registro ni edición)
// - Comunidad / Consulta Pública (Sin acceso a datos personales por Ley 1581)

export function normalizeRole(roleHeader) {
  if (!roleHeader) return 'Administrador';
  const r = roleHeader.toString().toLowerCase().trim();
  if (r.includes('admin')) return 'Administrador';
  if (r.includes('campo') || r.includes('tecnico') || r.includes('funcionar')) return 'Técnico de Campo';
  if (r.includes('audit') || r.includes('m&e') || r.includes('monitoreo')) return 'Auditor M&E';
  if (r.includes('comun') || r.includes('public') || r.includes('ciudadan')) return 'Comunidad';
  return 'Administrador';
}

/**
 * Middleware que adjunta el rol identificado a la request
 */
export function extractRole(req, res, next) {
  const roleHeader = req.headers['x-user-role'] || req.headers['x-rol'] || req.query.user_role;
  req.userRole = normalizeRole(roleHeader);
  next();
}

/**
 * Middleware que restringe acceso a rutas según roles permitidos
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const roleHeader = req.headers['x-user-role'] || req.headers['x-rol'] || req.query.user_role;
    const currentRole = normalizeRole(roleHeader);
    req.userRole = currentRole;

    // Normalizar lista de permitidos
    const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));

    if (!normalizedAllowed.includes(currentRole)) {
      // Mensaje adaptado según la restricción
      if (currentRole === 'Comunidad') {
        return res.status(403).json({
          success: false,
          error: 'Acceso Denegado por Política de Privacidad (Habeas Data)',
          message: 'El rol Comunidad / Consulta Pública no tiene autorización para acceder a datos personales ni expedientes individuales en cumplimiento de la Ley 1581 de 2012.',
          rol_actual: currentRole,
          roles_requeridos: allowedRoles
        });
      }

      if (currentRole === 'Auditor M&E' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(403).json({
          success: false,
          error: 'Operación no permitida en Modo Auditoría',
          message: 'El rol Auditor M&E tiene permisos exclusivos de solo lectura para garantizar la trazabilidad sin alteración de datos.',
          rol_actual: currentRole
        });
      }

      if (currentRole === 'Técnico de Campo' && req.originalUrl.includes('/exportar')) {
        return res.status(403).json({
          success: false,
          error: 'Exportación Reservada a Coordinación',
          message: 'La descarga de la base de datos completa está reservada para el Administrador / Coordinador para mitigar riesgos de filtración masiva.',
          rol_actual: currentRole
        });
      }

      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes',
        message: `La función solicitada no está permitida para el rol "${currentRole}".`,
        rol_actual: currentRole,
        roles_requeridos: allowedRoles
      });
    }

    next();
  };
}
