/**
 * Modelo de Dominio: Seguimiento
 * Registra lo que cambió, novedades y lo que queda pendiente (próxima acción, fecha contacto).
 */
export class Followup {
  constructor(data) {
    this.id = data.id || null;
    this.beneficiario_id = Number(data.beneficiario_id);
    this.fecha_seguimiento = data.fecha_seguimiento || new Date().toISOString().slice(0, 10);
    this.avance_novedad = data.avance_novedad;
    this.observacion = data.observacion || null;
    this.estado_caso = data.estado_caso || 'En seguimiento';
    this.accion_pendiente = data.accion_pendiente || null;
    this.proximo_contacto = data.proximo_contacto || null;
    this.responsable = data.responsable || null;
    this.creado_en = data.creado_en || null;

    // Metadatos adicionales para presentación
    this.beneficiario_nombre = data.beneficiario_nombre || null;
    this.beneficiario_codigo = data.beneficiario_codigo || null;
  }
}
