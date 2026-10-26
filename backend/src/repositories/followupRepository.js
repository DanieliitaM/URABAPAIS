import { db } from '../config/db.js';
import { Followup } from '../models/Followup.js';

export class FollowupRepository {
  async findAll({ estado_caso = '', limit = 50, offset = 0 } = {}) {
    if (db.isMysql()) {
      const pool = db.getPool();
      let sql = `
        SELECT s.*, b.nombre_completo as beneficiario_nombre, b.codigo_interno as beneficiario_codigo
        FROM seguimientos s
        JOIN beneficiarios b ON s.beneficiario_id = b.id
        WHERE 1=1
      `;
      const params = [];

      if (estado_caso) {
        sql += ' AND s.estado_caso = ?';
        params.push(estado_caso);
      }

      sql += ' ORDER BY s.fecha_seguimiento DESC, s.id DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const [rows] = await pool.query(sql, params);
      const [count] = await pool.query('SELECT COUNT(*) as total FROM seguimientos');
      return {
        data: rows.map(r => new Followup(r)),
        total: count[0].total
      };
    } else {
      const local = db.getLocalDb();
      let list = [...local.seguimientos];

      if (estado_caso) {
        list = list.filter(s => s.estado_caso === estado_caso);
      }

      const total = list.length;
      list.sort((a, b) => new Date(b.fecha_seguimiento) - new Date(a.fecha_seguimiento));
      const paginated = list.slice(offset, offset + limit);

      const items = paginated.map(s => {
        const b = local.beneficiarios.find(ben => ben.id === s.beneficiario_id) || {};
        return new Followup({
          ...s,
          beneficiario_nombre: b.nombre_completo || 'Beneficiario',
          beneficiario_codigo: b.codigo_interno || 'BEN-XXX'
        });
      });

      return { data: items, total };
    }
  }

  async findByBeneficiaryId(beneficiaryId) {
    const benId = Number(beneficiaryId);
    if (db.isMysql()) {
      const pool = db.getPool();
      const [rows] = await pool.query(
        'SELECT * FROM seguimientos WHERE beneficiario_id = ? ORDER BY fecha_seguimiento DESC',
        [benId]
      );
      return rows.map(r => new Followup(r));
    } else {
      const local = db.getLocalDb();
      return local.seguimientos
        .filter(s => s.beneficiario_id === benId)
        .map(s => new Followup(s));
    }
  }

  async create(data) {
    if (db.isMysql()) {
      const pool = db.getPool();
      const [res] = await pool.query(
        `INSERT INTO seguimientos (
          beneficiario_id, fecha_seguimiento, avance_novedad, observacion,
          estado_caso, accion_pendiente, proximo_contacto, responsable
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Number(data.beneficiario_id),
          data.fecha_seguimiento || new Date().toISOString().slice(0, 10),
          data.avance_novedad,
          data.observacion || null,
          data.estado_caso || 'En seguimiento',
          data.accion_pendiente,
          data.proximo_contacto || null,
          data.responsable || null
        ]
      );
      const [rows] = await pool.query(`
        SELECT s.*, b.nombre_completo as beneficiario_nombre, b.codigo_interno as beneficiario_codigo
        FROM seguimientos s
        JOIN beneficiarios b ON s.beneficiario_id = b.id
        WHERE s.id = ?
      `, [res.insertId]);
      return new Followup(rows[0]);
    } else {
      const local = db.getLocalDb();
      const newId = local.seguimientos.length > 0 ? Math.max(...local.seguimientos.map(s => s.id)) + 1 : 1;
      const rec = {
        id: newId,
        beneficiario_id: Number(data.beneficiario_id),
        fecha_seguimiento: data.fecha_seguimiento || new Date().toISOString().slice(0, 10),
        avance_novedad: data.avance_novedad,
        observacion: data.observacion || null,
        estado_caso: data.estado_caso || 'En seguimiento',
        accion_pendiente: data.accion_pendiente,
        proximo_contacto: data.proximo_contacto || null,
        responsable: data.responsable || null,
        creado_en: new Date().toISOString()
      };
      local.seguimientos.push(rec);
      db.saveLocalDb(local);
      const b = local.beneficiarios.find(ben => ben.id === rec.beneficiario_id) || {};
      return new Followup({
        ...rec,
        beneficiario_nombre: b.nombre_completo || 'Beneficiario',
        beneficiario_codigo: b.codigo_interno || 'BEN-XXX'
      });
    }
  }

  async update(id, data) {
    const numId = Number(id);
    if (db.isMysql()) {
      const pool = db.getPool();
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(data)) {
        if (key !== 'id' && key !== 'beneficiario_id' && key !== 'creado_en') {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) return null;
      values.push(numId);
      await pool.query(`UPDATE seguimientos SET ${fields.join(', ')} WHERE id = ?`, values);
      const [rows] = await pool.query('SELECT * FROM seguimientos WHERE id = ?', [numId]);
      return rows.length ? new Followup(rows[0]) : null;
    } else {
      const local = db.getLocalDb();
      const idx = local.seguimientos.findIndex(s => s.id === numId);
      if (idx === -1) return null;
      local.seguimientos[idx] = { ...local.seguimientos[idx], ...data };
      db.saveLocalDb(local);
      return new Followup(local.seguimientos[idx]);
    }
  }
}
