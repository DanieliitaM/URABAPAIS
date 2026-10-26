import { db } from '../config/db.js';
import { Attention } from '../models/Attention.js';

export class AttentionRepository {
  async findAll({ resultado_asociado = '', organizacion = '', limit = 50, offset = 0 } = {}) {
    if (db.isMysql()) {
      const pool = db.getPool();
      let sql = `
        SELECT a.*, b.nombre_completo as beneficiario_nombre, b.codigo_interno as beneficiario_codigo,
               prog.nombre as programa_nombre
        FROM atenciones a
        JOIN beneficiarios b ON a.beneficiario_id = b.id
        LEFT JOIN programas prog ON a.programa_id = prog.id
        WHERE 1=1
      `;
      const params = [];

      if (resultado_asociado) {
        sql += ' AND a.resultado_asociado = ?';
        params.push(resultado_asociado);
      }
      if (organizacion) {
        sql += ' AND a.organizacion = ?';
        params.push(organizacion);
      }

      sql += ' ORDER BY a.fecha_atencion DESC, a.id DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const [rows] = await pool.query(sql, params);
      const [count] = await pool.query('SELECT COUNT(*) as total FROM atenciones');
      return {
        data: rows.map(r => new Attention(r)),
        total: count[0].total
      };
    } else {
      const local = db.getLocalDb();
      let list = [...local.atenciones];

      if (resultado_asociado) {
        list = list.filter(a => a.resultado_asociado === resultado_asociado);
      }
      if (organizacion) {
        list = list.filter(a => a.organizacion === organizacion);
      }

      const total = list.length;
      list.sort((a, b) => new Date(b.fecha_atencion) - new Date(a.fecha_atencion));
      const paginated = list.slice(offset, offset + limit);

      const items = paginated.map(a => {
        const b = local.beneficiarios.find(ben => ben.id === a.beneficiario_id) || {};
        const prog = local.programas.find(p => p.id === a.programa_id) || {};
        return new Attention({
          ...a,
          beneficiario_nombre: b.nombre_completo || 'Beneficiario',
          beneficiario_codigo: b.codigo_interno || 'BEN-XXX',
          programa_nombre: prog.nombre || null
        });
      });

      return { data: items, total };
    }
  }

  async findByBeneficiaryId(beneficiaryId) {
    const benId = Number(beneficiaryId);
    if (db.isMysql()) {
      const pool = db.getPool();
      const [rows] = await pool.query(`
        SELECT a.*, prog.nombre as programa_nombre
        FROM atenciones a
        LEFT JOIN programas prog ON a.programa_id = prog.id
        WHERE a.beneficiario_id = ?
        ORDER BY a.fecha_atencion DESC
      `, [benId]);
      return rows.map(r => new Attention(r));
    } else {
      const local = db.getLocalDb();
      return local.atenciones
        .filter(a => a.beneficiario_id === benId)
        .map(a => {
          const prog = local.programas.find(p => p.id === a.programa_id) || {};
          return new Attention({
            ...a,
            programa_nombre: prog.nombre || null
          });
        });
    }
  }

  async create(data) {
    if (db.isMysql()) {
      const pool = db.getPool();
      const [res] = await pool.query(
        `INSERT INTO atenciones (
          beneficiario_id, programa_id, fecha_atencion, tipo_atencion_ayuda,
          actividad_recibida, resultado_asociado, descripcion, organizacion,
          responsable, resultado, remitido_a, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Number(data.beneficiario_id),
          data.programa_id ? Number(data.programa_id) : null,
          data.fecha_atencion || new Date().toISOString().slice(0, 10),
          data.tipo_atencion_ayuda,
          data.actividad_recibida || null,
          data.resultado_asociado || null,
          data.descripcion,
          data.organizacion || 'COOPI',
          data.responsable || null,
          data.resultado || 'Atendido',
          data.remitido_a || null,
          data.observaciones || null
        ]
      );
      const [rows] = await pool.query(`
        SELECT a.*, b.nombre_completo as beneficiario_nombre, b.codigo_interno as beneficiario_codigo
        FROM atenciones a
        JOIN beneficiarios b ON a.beneficiario_id = b.id
        WHERE a.id = ?
      `, [res.insertId]);
      return new Attention(rows[0]);
    } else {
      const local = db.getLocalDb();
      const newId = local.atenciones.length > 0 ? Math.max(...local.atenciones.map(a => a.id)) + 1 : 1;
      const rec = {
        id: newId,
        beneficiario_id: Number(data.beneficiario_id),
        programa_id: data.programa_id ? Number(data.programa_id) : null,
        fecha_atencion: data.fecha_atencion || new Date().toISOString().slice(0, 10),
        tipo_atencion_ayuda: data.tipo_atencion_ayuda,
        actividad_recibida: data.actividad_recibida || null,
        resultado_asociado: data.resultado_asociado || null,
        descripcion: data.descripcion,
        organizacion: data.organizacion || 'COOPI',
        responsable: data.responsable || null,
        resultado: data.resultado || 'Atendido',
        remitido_a: data.remitido_a || null,
        observaciones: data.observaciones || null,
        creado_en: new Date().toISOString()
      };
      local.atenciones.push(rec);
      db.saveLocalDb(local);
      const b = local.beneficiarios.find(ben => ben.id === rec.beneficiario_id) || {};
      return new Attention({
        ...rec,
        beneficiario_nombre: b.nombre_completo || 'Beneficiario',
        beneficiario_codigo: b.codigo_interno || 'BEN-XXX'
      });
    }
  }
}
