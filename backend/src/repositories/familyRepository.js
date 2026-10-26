import { db } from '../config/db.js';
import { FamilyMember } from '../models/FamilyMember.js';

export class FamilyRepository {
  async findByBeneficiaryId(beneficiaryId) {
    const benId = Number(beneficiaryId);
    if (db.isMysql()) {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT * FROM familiares WHERE beneficiario_id = ? ORDER BY id ASC', [benId]);
      return rows.map(r => new FamilyMember(r));
    } else {
      const local = db.getLocalDb();
      return local.familiares.filter(f => f.beneficiario_id === benId).map(f => new FamilyMember(f));
    }
  }

  async create(data) {
    if (db.isMysql()) {
      const pool = db.getPool();
      const [result] = await pool.query(
        `INSERT INTO familiares (beneficiario_id, nombre_completo, parentesco, edad, tipo_documento, numero_documento, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          Number(data.beneficiario_id),
          data.nombre_completo,
          data.parentesco,
          data.edad || null,
          data.tipo_documento || null,
          data.numero_documento || null,
          data.observaciones || null
        ]
      );
      const [created] = await pool.query('SELECT * FROM familiares WHERE id = ?', [result.insertId]);
      return new FamilyMember(created[0]);
    } else {
      const local = db.getLocalDb();
      const newId = local.familiares.length > 0 ? Math.max(...local.familiares.map(f => f.id)) + 1 : 1;
      const record = {
        id: newId,
        beneficiario_id: Number(data.beneficiario_id),
        nombre_completo: data.nombre_completo,
        parentesco: data.parentesco,
        edad: data.edad || null,
        tipo_documento: data.tipo_documento || null,
        numero_documento: data.numero_documento || null,
        observaciones: data.observaciones || null,
        creado_en: new Date().toISOString()
      };
      local.familiares.push(record);
      db.saveLocalDb(local);
      return new FamilyMember(record);
    }
  }

  async delete(id) {
    const numId = Number(id);
    if (db.isMysql()) {
      const pool = db.getPool();
      const [res] = await pool.query('DELETE FROM familiares WHERE id = ?', [numId]);
      return res.affectedRows > 0;
    } else {
      const local = db.getLocalDb();
      const initial = local.familiares.length;
      local.familiares = local.familiares.filter(f => f.id !== numId);
      db.saveLocalDb(local);
      return local.familiares.length < initial;
    }
  }
}
