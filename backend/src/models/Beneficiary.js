/**
 * Modelo de Dominio: Beneficiario
 * Representa la unidad central del sistema URABÁ-PAÍS.
 * Cada persona física conserva un único código interno inmutable (ej. BEN-001).
 */
export class Beneficiary {
  constructor(data) {
    this.id = data.id || null;
    this.codigo_interno = data.codigo_interno || null;
    this.tipo_documento = data.tipo_documento || null;
    this.numero_documento = data.numero_documento || null;
    this.nombre_completo = data.nombre_completo;
    this.sexo = data.sexo || null;
    this.edad = data.edad !== undefined && data.edad !== null ? Number(data.edad) : null;
    this.fecha_nacimiento = data.fecha_nacimiento || null;
    this.telefono = data.telefono || null;
    this.correo = data.correo || null;
    this.municipio = data.municipio;
    this.zona = data.zona || 'Urbana';
    this.direccion = data.direccion || null;
    this.nacionalidad = data.nacionalidad || 'Colombiana';
    this.tipo_poblacion = data.tipo_poblacion || 'Comunidad de acogida';
    this.organizacion_responsable = data.organizacion_responsable || 'COOPI';
    this.tiene_discapacidad = Boolean(data.tiene_discapacidad);
    this.tipo_discapacidad = data.tipo_discapacidad || null;
    this.autorizacion_datos = Boolean(data.autorizacion_datos);
    this.fecha_autorizacion = data.fecha_autorizacion || new Date().toISOString();
    this.fecha_registro = data.fecha_registro || new Date().toISOString().slice(0, 10);
    this.estado_general = data.estado_general || 'Activo';
    this.creado_en = data.creado_en || null;
    this.actualizado_en = data.actualizado_en || null;

    // Relaciones consolidadas
    this.familiares = data.familiares || [];
    this.participaciones = data.participaciones || [];
    this.atenciones = data.atenciones || [];
    this.seguimientos = data.seguimientos || [];
  }

  // Genera código interno inmutable con formato legible
  static generateInternalCode(nextSequenceNumber) {
    return `BEN-${String(nextSequenceNumber).padStart(4, '0')}`;
  }

  // Retorna vista pública sin información sensible (para reportes públicos)
  toPublicView() {
    return {
      codigo_interno: this.codigo_interno,
      municipio: this.municipio,
      zona: this.zona,
      tipo_poblacion: this.tipo_poblacion,
      organizacion_responsable: this.organizacion_responsable,
      fecha_registro: this.fecha_registro
    };
  }
}
