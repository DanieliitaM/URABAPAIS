/**
 * Modelo de Dominio: Familiar (Núcleo Familiar)
 */
export class FamilyMember {
  constructor(data) {
    this.id = data.id || null;
    this.beneficiario_id = Number(data.beneficiario_id);
    this.nombre_completo = data.nombre_completo;
    this.parentesco = data.parentesco;
    this.edad = data.edad !== undefined && data.edad !== null ? Number(data.edad) : null;
    this.tipo_documento = data.tipo_documento || null;
    this.numero_documento = data.numero_documento || null;
    this.observaciones = data.observaciones || null;
    this.creado_en = data.creado_en || null;
  }
}
