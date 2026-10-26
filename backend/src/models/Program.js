/**
 * Modelo de Dominio: Programa
 */
export class Program {
  constructor(data) {
    this.id = data.id || null;
    this.codigo = data.codigo;
    this.nombre = data.nombre;
    this.linea_trabajo = data.linea_trabajo;
    this.meta_estimada = Number(data.meta_estimada || 0);
    this.organizacion_lider = data.organizacion_lider;
    this.descripcion = data.descripcion || null;
    this.activo = data.activo !== undefined ? Boolean(data.activo) : true;
    this.creado_en = data.creado_en || null;
  }
}
