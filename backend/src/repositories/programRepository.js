import { db } from '../config/db.js';
import { Program } from '../models/Program.js';

export class ProgramRepository {
  async findAll() {
    if (db.isMysql()) {
      const pool = db.getPool();
      const [rows] = await pool.query(`
        SELECT p.*,
          (SELECT COUNT(DISTINCT beneficiario_id) FROM participaciones WHERE programa_id = p.id) as total_inscritos,
          (SELECT COUNT(*) FROM atenciones WHERE programa_id = p.id) as total_atenciones
        FROM programas p
        ORDER BY p.id ASC
      `);
      return rows.map(r => ({
        ...new Program(r),
        total_inscritos: Number(r.total_inscritos || 0),
        total_atenciones: Number(r.total_atenciones || 0)
      }));
    } else {
      const local = db.getLocalDb();
      return local.programas.map(p => {
        const inscritos = new Set(
          local.participaciones.filter(part => part.programa_id === p.id).map(part => part.beneficiario_id)
        ).size;
        const atenciones = local.atenciones.filter(a => a.programa_id === p.id).length;
        return {
          ...new Program(p),
          total_inscritos: inscritos,
          total_atenciones: atenciones
        };
      });
    }
  }

  async findById(id) {
    const numId = Number(id);
    if (db.isMysql()) {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT * FROM programas WHERE id = ?', [numId]);
      return rows.length ? new Program(rows[0]) : null;
    } else {
      const local = db.getLocalDb();
      const found = local.programas.find(p => p.id === numId);
      return found ? new Program(found) : null;
    }
  }

  async create(data) {
    if (db.isMysql()) {
      const pool = db.getPool();
      const [res] = await pool.query(
        `INSERT INTO programas (codigo, nombre, linea_trabajo, meta_estimada, organizacion_lider, descripcion, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.codigo,
          data.nombre,
          data.linea_trabajo,
          data.meta_estimada || 0,
          data.organizacion_lider,
          data.descripcion || null,
          data.activo ? 1 : 0
        ]
      );
      return await this.findById(res.insertId);
    } else {
      const local = db.getLocalDb();
      const newId = local.programas.length > 0 ? Math.max(...local.programas.map(p => p.id)) + 1 : 1;
      const rec = {
        id: newId,
        codigo: data.codigo,
        nombre: data.nombre,
        linea_trabajo: data.linea_trabajo,
        meta_estimada: data.meta_estimada || 0,
        organizacion_lider: data.organizacion_lider,
        descripcion: data.descripcion || null,
        activo: data.activo ? 1 : 0,
        creado_en: new Date().toISOString()
      };
      local.programas.push(rec);
      db.saveLocalDb(local);
      return new Program(rec);
    }
  }
}
