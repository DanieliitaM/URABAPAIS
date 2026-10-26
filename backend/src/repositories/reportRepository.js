import { db } from '../config/db.js';

export class ReportRepository {
  async getDashboardMetrics() {
    if (db.isMysql()) {
      const pool = db.getPool();

      // 1. Beneficiarios únicos
      const [uBens] = await pool.query('SELECT COUNT(DISTINCT id) as total_unicos FROM beneficiarios');
      
      // 2. Participaciones por programa
      const [partsByProg] = await pool.query(`
        SELECT p.codigo, p.nombre, p.linea_trabajo, p.meta_estimada,
               COUNT(part.id) as total_participaciones,
               COUNT(DISTINCT part.beneficiario_id) as beneficiarios_unicos
        FROM programas p
        LEFT JOIN participaciones part ON p.id = part.programa_id
        GROUP BY p.id, p.codigo, p.nombre, p.linea_trabajo, p.meta_estimada
        ORDER BY p.id ASC
      `);

      // 3. Total atenciones / ayudas registradas
      const [totalAtenciones] = await pool.query('SELECT COUNT(*) as total FROM atenciones');

      // 4. Atenciones agrupadas por resultado (R1, R2, R3)
      const [atencionesByResultado] = await pool.query(`
        SELECT COALESCE(resultado_asociado, 'General') as resultado, COUNT(*) as total
        FROM atenciones
        GROUP BY resultado_asociado
      `);

      // 5. Seguimientos pendientes
      const [segPendientes] = await pool.query(`
        SELECT COUNT(*) as total FROM seguimientos
        WHERE estado_caso IN ('Pendiente', 'En seguimiento')
      `);

      const [segTotal] = await pool.query('SELECT COUNT(*) as total FROM seguimientos');

      // 6. Desglose por Municipio (Apartadó, Turbo, Necoclí)
      const [byMunicipio] = await pool.query(`
        SELECT municipio, COUNT(*) as total
        FROM beneficiarios
        GROUP BY municipio
        ORDER BY total DESC
      `);

      // 7. Desglose por Tipo de Población
      const [byPoblacion] = await pool.query(`
        SELECT COALESCE(tipo_poblacion, 'No especificado') as tipo, COUNT(*) as total
        FROM beneficiarios
        GROUP BY tipo_poblacion
        ORDER BY total DESC
      `);

      // 8. Desglose por Género
      const [byGenero] = await pool.query(`
        SELECT COALESCE(sexo, 'No especificado') as sexo, COUNT(*) as total
        FROM beneficiarios
        GROUP BY sexo
      `);

      // 9. Desglose por Zona (Urbana vs Rural)
      const [byZona] = await pool.query(`
        SELECT COALESCE(zona, 'Urbana') as zona, COUNT(*) as total
        FROM beneficiarios
        GROUP BY zona
      `);

      return {
        resumen: {
          beneficiarios_unicos: Number(uBens[0].total_unicos || 0),
          total_participaciones: partsByProg.reduce((acc, curr) => acc + Number(curr.total_participaciones || 0), 0),
          total_atenciones: Number(totalAtenciones[0].total || 0),
          seguimientos_pendientes: Number(segPendientes[0].total || 0),
          total_seguimientos: Number(segTotal[0].total || 0),
          meta_global_proyecto: 11447
        },
        programas: partsByProg,
        atenciones_por_linea: atencionesByResultado,
        por_municipio: byMunicipio,
        por_poblacion: byPoblacion,
        por_genero: byGenero,
        por_zona: byZona
      };
    } else {
      // Local fallback
      const local = db.getLocalDb();

      const uniqueBeneficiaries = local.beneficiarios.length;
      const totalAttentions = local.atenciones.length;
      const pendingFollowups = local.seguimientos.filter(
        s => s.estado_caso === 'Pendiente' || s.estado_caso === 'En seguimiento'
      ).length;

      const programs = local.programas.map(p => {
        const parts = local.participaciones.filter(part => part.programa_id === p.id);
        const uniqueInProg = new Set(parts.map(pt => pt.beneficiario_id)).size;
        return {
          codigo: p.codigo,
          nombre: p.nombre,
          linea_trabajo: p.linea_trabajo,
          meta_estimada: p.meta_estimada,
          total_participaciones: parts.length,
          beneficiarios_unicos: uniqueInProg
        };
      });

      // Group atenciones by resultado
      const atencionesMap = {};
      local.atenciones.forEach(a => {
        const key = a.resultado_asociado || 'General';
        atencionesMap[key] = (atencionesMap[key] || 0) + 1;
      });
      const atenciones_por_linea = Object.entries(atencionesMap).map(([resultado, total]) => ({ resultado, total }));

      // By municipio
      const munMap = {};
      local.beneficiarios.forEach(b => {
        const m = b.municipio || 'Apartadó';
        munMap[m] = (munMap[m] || 0) + 1;
      });
      const por_municipio = Object.entries(munMap).map(([municipio, total]) => ({ municipio, total }));

      // By poblacion
      const pobMap = {};
      local.beneficiarios.forEach(b => {
        const p = b.tipo_poblacion || 'Comunidad de acogida';
        pobMap[p] = (pobMap[p] || 0) + 1;
      });
      const por_poblacion = Object.entries(pobMap).map(([tipo, total]) => ({ tipo, total }));

      // By gender
      const genMap = {};
      local.beneficiarios.forEach(b => {
        const g = b.sexo || 'No especificado';
        genMap[g] = (genMap[g] || 0) + 1;
      });
      const por_genero = Object.entries(genMap).map(([sexo, total]) => ({ sexo, total }));

      // By zona
      const zonaMap = {};
      local.beneficiarios.forEach(b => {
        const z = b.zona || 'Urbana';
        zonaMap[z] = (zonaMap[z] || 0) + 1;
      });
      const por_zona = Object.entries(zonaMap).map(([zona, total]) => ({ zona, total }));

      return {
        resumen: {
          beneficiarios_unicos: uniqueBeneficiaries,
          total_participaciones: local.participaciones.length,
          total_atenciones: totalAttentions,
          seguimientos_pendientes: pendingFollowups,
          total_seguimientos: local.seguimientos.length,
          meta_global_proyecto: 11447
        },
        programas,
        atenciones_por_linea,
        por_municipio,
        por_poblacion,
        por_genero,
        por_zona
      };
    }
  }
}
