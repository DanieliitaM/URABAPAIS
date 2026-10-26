/**
 * Servicio Complementario: Asistente Inteligente URABÁ-PAÍS
 * Cumple estrictamente con los límites éticos (Sección 10.1 de la Guía):
 * - No emite diagnósticos médicos ni psicológicos
 * - No decide asignación ni elegibilidad
 * - Actúa como apoyo informativo y síntesis de historial
 */
export class AiAssistantService {
  static generateCaseSummary(beneficiaryConsolidated) {
    const b = beneficiaryConsolidated;
    const lines = [];

    lines.push(`Resumen de Caso para Ficha [${b.codigo_interno}]`);
    lines.push(`Ubicación: ${b.municipio} (${b.zona}). Condición reportada: ${b.tipo_poblacion || 'Comunidad de acogida'}.`);

    const famCount = b.familiares ? b.familiares.length : 0;
    lines.push(`Núcleo familiar registrado: ${famCount} integrante(s) dependiente(s).`);

    const progNames = (b.participaciones || []).map(p => `${p.programa_nombre} (${p.estado})`).join(', ');
    lines.push(`Vinculaciones a programas: ${progNames || 'Sin programas asignados aún'}.`);

    const atencionesCount = b.atenciones ? b.atenciones.length : 0;
    lines.push(`Historial de atenciones/ayudas: ${atencionesCount} servicio(s) registrado(s).`);

    const segPendientes = (b.seguimientos || []).filter(s => s.estado_caso === 'Pendiente' || s.estado_caso === 'En seguimiento');
    if (segPendientes.length > 0) {
      lines.push(`⚠️ Alerta de seguimiento: ${segPendientes.length} acción(es) pendiente(s). Próxima acción registrada: "${segPendientes[0].accion_pendiente || 'Sin detalle'}".`);
    } else {
      lines.push(`✅ No presenta alertas pendientes inmediatas.`);
    }

    return {
      aviso_legal: 'Nota: Este resumen es una herramienta de asistencia operativa. No constituye una decisión institucional ni diagnóstico médico/jurídico.',
      resumen_texto: lines.join('\n'),
      total_servicios: atencionesCount,
      alertas_activas: segPendientes.length,
      proximo_paso_sugerido: segPendientes.length > 0 ? segPendientes[0].accion_pendiente : 'Revisión periódica de estado en programa'
    };
  }
}
