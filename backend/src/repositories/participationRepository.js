import { db } from '../config/db.js';
import { Participation } from '../models/Participation.js';

export class ParticipationRepository {
  async findByBeneficiaryId(beneficiaryId) {
    const benId = Number(beneficiaryId);
    if (db.isMysql()) {
      const pool = db.getPool();
      const [rows] = await pool.query(`
        SELECT p.*, prog.nombre as programa_nombre, prog.codigo as programa_codigo, prog.linea_trabajo
        FROM participaciones p
        JOIN programas prog ON p.programa_id = prog.id
        WHERE p.beneficiario_id = ?
        ORDER BY p.fecha_vinculacion DESC
      `, [benId]);
      return rows.map(r => new Participation(r));
    } else {
      const local = db.getLocalDb();
      return local.participaciones
        .filter(p => p.beneficiario_id === benId)
        .map(p => {
          const prog = local.programas.find(pr => pr.id === p.programa_id) || {};
          return new Participation({
            ...p,
            programa_nombre: prog.nombre || 'Programa',
            programa_codigo: prog.codigo || 'R',
            linea_trabajo: prog.linea_trabajo || 'Línea'
          });
        });
    }
  }

  async findByBeneficiaryAndProgram(beneficiaryId, programId) {
    const benId = Number(beneficiaryId);
    const progId = Number(programId);
    if (db.isMysql()) {
      const pool = db.getPool();
      const [rows] = await pool.query(
        'SELECT * FROM participaciones WHERE beneficiario_id = ? AND programa_id = ?',
        [benId, progId]
      );
      return rows.length ? new Participation(rows[0]) : null;
    } else {
      const local = db.getLocalDb();
      const found = local.participaciones.find(p => p.beneficiario_id === benId && p.programa_id === progId);
      return found ? new Participation(found) : null;
    }
  }

  async create(data) {
    if (db.isMysql()) {
      const pool = db.getPool();
      const [res] = await pool.query(
        `INSERT INTO participaciones (beneficiario_id, programa_id, fecha_vinculacion, estado, motivo_cambio)
         VALUES (?, ?, ?, ?, ?)`,
        [
          Number(data.beneficiario_id),
          Number(data.programa_id),
          data.fecha_vinculacion || new Date().toISOString().slice(0, 10),
          data.estado || 'Inscrito',
          data.motivo_cambio || null
        ]
      );
      const [rows] = await pool.query(`
        SELECT p.*, prog.nombre as programa_nombre, prog.codigo as programa_codigo, prog.linea_trabajo
        FROM participaciones p
        JOIN programas prog ON p.programa_id = prog.id
        WHERE p.id = ?
      `, [res.insertId]);
      return new Participation(rows[0]);
    } else {
      const local = db.getLocalDb();
      const newId = local.participaciones.length > 0 ? Math.max(...local.participaciones.map(p => p.id)) + 1 : 1;
      const rec = {
        id: newId,
        beneficiario_id: Number(data.beneficiario_id),
        programa_id: Number(data.programa_id),
        fecha_vinculacion: data.fecha_vinculacion || new Date().toISOString().slice(0, 10),
        estado: data.estado || 'Inscrito',
        motivo_cambio: data.motivo_cambio || null,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };
      local.participaciones.push(rec);
      db.saveLocalDb(local);
      const prog = local.programas.find(pr => pr.id === rec.programa_id) || {};
      return new Participation({
        ...rec,
        programa_nombre: prog.nombre,
        programa_codigo: prog.codigo,
        linea_trabajo: prog.linea_trabajo
      });
    }
  }

  async updateStatus(id, estado, motivo_cambio = null) {
    const numId = Number(id);
    if (db.isMysql()) {
      const pool = db.getPool();
      await pool.query(
        'UPDATE participaciones SET estado = ?, motivo_cambio = ? WHERE id = ?',
        [estado, motivo_cambio, numId]
      );
      const [rows] = await pool.query(`
        SELECT p.*, prog.nombre as programa_nombre, prog.codigo as programa_codigo, prog.linea_trabajo
        FROM participaciones p
        JOIN programas prog ON p.programa_id = prog.id
        WHERE p.id = ?
      `, [numId]);
      return rows.length ? new Participation(rows[0]) : null;
    } else {
      const local = db.getLocalDb();
      const idx = local.participaciones.findIndex(p => p.id === numId);
      if (idx === -1) return null;
      local.participaciones[idx].estado = estado;
      if (motivo_cambio) local.participaciones[idx].motivo_cambio = motivo_cambio;
      local.participaciones[idx].actualizado_en = new Date().toISOString();
      db.saveLocalDb(local);
      const rec = local.participaciones[idx];
      const prog = local.programas.find(pr => pr.id === rec.programa_id) || {};
      return new Participation({
        ...rec,
        programa_nombre: prog.nombre,
        programa_codigo: prog.codigo,
        linea_trabajo: prog.linea_trabajo
      });
    }
  }
}
