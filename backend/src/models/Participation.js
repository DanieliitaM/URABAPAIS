/**
 * Modelo de Dominio: Participación
 * Representa la vinculación de un beneficiario con un programa.
 * Estados: Inscrito, En proceso, Finalizado, Retirado
 */
export class Participation {
  constructor(data) {
    this.id = data.id || null;
    this.beneficiario_id = Number(data.beneficiario_id);
    this.programa_id = Number(data.programa_id);
    this.fecha_vinculacion = data.fecha_vinculacion || new Date().toISOString().slice(0, 10);
    this.estado = data.estado || 'Inscrito';
    this.motivo_cambio = data.motivo_cambio || null;
    this.creado_en = data.creado_en || null;
    this.actualizado_en = data.actualizado_en || null;

    // Campos del programa si viene de un JOIN
    this.programa_codigo = data.programa_codigo || null;
    this.programa_nombre = data.programa_nombre || null;
    this.linea_trabajo = data.linea_trabajo || null;
  }
}
