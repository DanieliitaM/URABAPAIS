/**
 * Modelo de Dominio: Atención o Ayuda
 * Registra lo que se entregó o realizó (asistencia, kit, atención médica, psicosocial, etc.)
 */
export class Attention {
  constructor(data) {
    this.id = data.id || null;
    this.beneficiario_id = Number(data.beneficiario_id);
    this.programa_id = data.programa_id ? Number(data.programa_id) : null;
    this.fecha_atencion = data.fecha_atencion || new Date().toISOString().slice(0, 10);
    this.tipo_atencion_ayuda = data.tipo_atencion_ayuda;
    this.actividad_recibida = data.actividad_recibida || null;
    this.resultado_asociado = data.resultado_asociado || null;
    this.descripcion = data.descripcion;
    this.organizacion = data.organizacion || 'COOPI';
    this.responsable = data.responsable || null;
    this.resultado = data.resultado || 'Atendido';
    this.remitido_a = data.remitido_a || null;
    this.observaciones = data.observaciones || null;
    this.creado_en = data.creado_en || null;

    // Metadatos adicionales para presentación
    this.beneficiario_nombre = data.beneficiario_nombre || null;
    this.beneficiario_codigo = data.beneficiario_codigo || null;
  }
}
