import { ReportRepository } from '../repositories/reportRepository.js';

export class ReportService {
  constructor() {
    this.reportRepo = new ReportRepository();
  }

  async getDashboardData() {
    const data = await this.reportRepo.getDashboardMetrics();

    // Calcular porcentaje de cumplimiento frente a la meta global de 11.447 personas
    const metaGlobal = 11447;
    const alcanzado = data.resumen.beneficiarios_unicos;
    const porcentajeGlobal = metaGlobal > 0 ? ((alcanzado / metaGlobal) * 100).toFixed(1) : 0;

    return {
      ...data,
      indicadores_clave: {
        meta_global: metaGlobal,
        beneficiarios_unicos: alcanzado,
        porcentaje_alcance: Number(porcentajeGlobal),
        total_eventos_servicios: data.resumen.total_atenciones + data.resumen.total_participaciones,
        alertas_pendientes: data.resumen.seguimientos_pendientes
      }
    };
  }

  // Genera reporte exportable estructurado (para CSV o frontend Excel)
  async getExportableSummary() {
    const data = await this.getDashboardData();
    return {
      titulo: 'Reporte Consolidado de Indicadores - Proyecto URABÁ-PAÍS',
      generado_el: new Date().toISOString(),
      resumen_ejecutivo: data.resumen,
      programas: data.programas,
      distribucion_territorial: data.por_municipio,
      distribucion_poblacional: data.por_poblacion,
      atenciones_por_linea: data.atenciones_por_linea
    };
  }
}
