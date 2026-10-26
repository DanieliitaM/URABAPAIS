import { db } from '../config/db.js';
import { Beneficiary } from '../models/Beneficiary.js';

export class BeneficiaryRepository {
  async findAll({ search = '', municipio = '', tipo_poblacion = '', limit = 50, offset = 0 } = {}) {
    if (db.isMysql()) {
      const pool = db.getPool();
      let sql = 'SELECT * FROM beneficiarios WHERE 1=1';
      const params = [];

      if (municipio) {
        sql += ' AND municipio = ?';
        params.push(municipio);
      }
      if (tipo_poblacion) {
        sql += ' AND tipo_poblacion = ?';
        params.push(tipo_poblacion);
      }
      if (search) {
        sql += ' AND (nombre_completo LIKE ? OR codigo_interno LIKE ? OR numero_documento LIKE ?)';
        const queryTerm = `%${search}%`;
        params.push(queryTerm, queryTerm, queryTerm);
      }

      sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const [rows] = await pool.query(sql, params);
      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM beneficiarios');

      return {
        data: rows.map(r => new Beneficiary(r)),
        total: countResult[0].total
      };
    } else {
      // Local fallback
      const local = db.getLocalDb();
      let list = [...local.beneficiarios];

      if (municipio) {
        list = list.filter(b => b.municipio === municipio);
      }
      if (tipo_poblacion) {
        list = list.filter(b => b.tipo_poblacion === tipo_poblacion);
      }
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(b =>
          (b.nombre_completo && b.nombre_completo.toLowerCase().includes(s)) ||
          (b.codigo_interno && b.codigo_interno.toLowerCase().includes(s)) ||
          (b.numero_documento && b.numero_documento.toLowerCase().includes(s))
        );
      }

      const total = list.length;
      list.sort((a, b) => b.id - a.id);
      const paginated = list.slice(offset, offset + limit);

      return {
        data: paginated.map(b => new Beneficiary(b)),
        total
      };
    }
  }

  async findById(id) {
    const numId = Number(id);
    if (db.isMysql()) {
      const pool = db.getPool();
      const [rows] = await pool.query('SELECT * FROM beneficiarios WHERE id = ?', [numId]);
      return rows.length ? new Beneficiary(rows[0]) : null;
    } else {
      const local = db.getLocalDb();
      const found = local.beneficiarios.find(b => b.id === numId);
      return found ? new Beneficiary(found) : null;
    }
  }

  async findByDocument(tipo_documento, numero_documento) {
    if (!numero_documento) return null;
    if (db.isMysql()) {
      const pool = db.getPool();
      const [rows] = await pool.query(
        'SELECT * FROM beneficiarios WHERE tipo_documento = ? AND numero_documento = ?',
        [tipo_documento, numero_documento]
      );
      return rows.length ? new Beneficiary(rows[0]) : null;
    } else {
      const local = db.getLocalDb();
      const found = local.beneficiarios.find(
        b => b.tipo_documento === tipo_documento && b.numero_documento === numero_documento
      );
      return found ? new Beneficiary(found) : null;
    }
  }

  async findSimilar({ nombre_completo = '', telefono = '', edad = null }) {
    if (db.isMysql()) {
      const pool = db.getPool();
      const conditions = [];
      const params = [];

      if (nombre_completo && nombre_completo.length >= 3) {
        conditions.push('nombre_completo LIKE ?');
        params.push(`%${nombre_completo.trim()}%`);
      }
      if (telefono && telefono.length >= 6) {
        conditions.push('telefono = ?');
        params.push(telefono.trim());
      }
      if (edad !== null && edad !== undefined && edad !== '') {
        conditions.push('edad = ?');
        params.push(Number(edad));
      }

      if (conditions.length === 0) return [];

      const sql = `SELECT * FROM beneficiarios WHERE ${conditions.join(' OR ')} LIMIT 10`;
      const [rows] = await pool.query(sql, params);
      return rows.map(r => new Beneficiary(r));
    } else {
      const local = db.getLocalDb();
      const qName = nombre_completo.toLowerCase().trim();
      const qTel = telefono ? telefono.trim() : '';

      return local.beneficiarios.filter(b => {
        let match = false;
        if (qName && b.nombre_completo && b.nombre_completo.toLowerCase().includes(qName)) match = true;
        if (qTel && b.telefono && b.telefono === qTel) match = true;
        if (edad !== null && edad !== undefined && b.edad === Number(edad) && qName.length > 2) match = true;
        return match;
      }).slice(0, 10).map(b => new Beneficiary(b));
    }
  }

  async create(data) {
    if (db.isMysql()) {
      const pool = db.getPool();
      const [countRow] = await pool.query('SELECT COUNT(*) as total FROM beneficiarios');
      const nextCode = Beneficiary.generateInternalCode(countRow[0].total + 1);

      const [result] = await pool.query(
        `INSERT INTO beneficiarios (
          codigo_interno, tipo_documento, numero_documento, nombre_completo,
          sexo, edad, fecha_nacimiento, telefono, correo, municipio,
          zona, direccion, nacionalidad, tipo_poblacion, organizacion_responsable,
          tiene_discapacidad, tipo_discapacidad, autorizacion_datos, fecha_registro, estado_general
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.codigo_interno || nextCode,
          data.tipo_documento || null,
          data.numero_documento || null,
          data.nombre_completo,
          data.sexo || null,
          data.edad || null,
          data.fecha_nacimiento || null,
          data.telefono || null,
          data.correo || null,
          data.municipio,
          data.zona || 'Urbana',
          data.direccion || null,
          data.nacionalidad || 'Colombiana',
          data.tipo_poblacion || 'Comunidad de acogida',
          data.organizacion_responsable || 'COOPI',
          data.tiene_discapacidad ? 1 : 0,
          data.tipo_discapacidad || null,
          data.autorizacion_datos ? 1 : 0,
          data.fecha_registro || new Date().toISOString().slice(0, 10),
          data.estado_general || 'Activo'
        ]
      );

      return await this.findById(result.insertId);
    } else {
      const local = db.getLocalDb();
      const newId = local.beneficiarios.length > 0 ? Math.max(...local.beneficiarios.map(b => b.id)) + 1 : 1;
      const nextCode = Beneficiary.generateInternalCode(newId);

      const newRecord = {
        id: newId,
        codigo_interno: data.codigo_interno || nextCode,
        tipo_documento: data.tipo_documento || null,
        numero_documento: data.numero_documento || null,
        nombre_completo: data.nombre_completo,
        sexo: data.sexo || null,
        edad: data.edad || null,
        fecha_nacimiento: data.fecha_nacimiento || null,
        telefono: data.telefono || null,
        correo: data.correo || null,
        municipio: data.municipio,
        zona: data.zona || 'Urbana',
        direccion: data.direccion || null,
        nacionalidad: data.nacionalidad || 'Colombiana',
        tipo_poblacion: data.tipo_poblacion || 'Comunidad de acogida',
        organizacion_responsable: data.organizacion_responsable || 'COOPI',
        tiene_discapacidad: data.tiene_discapacidad ? 1 : 0,
        tipo_discapacidad: data.tipo_discapacidad || null,
        autorizacion_datos: data.autorizacion_datos ? 1 : 0,
        fecha_autorizacion: new Date().toISOString(),
        fecha_registro: data.fecha_registro || new Date().toISOString().slice(0, 10),
        estado_general: data.estado_general || 'Activo',
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };

      local.beneficiarios.push(newRecord);
      db.saveLocalDb(local);
      return new Beneficiary(newRecord);
    }
  }

  async update(id, data) {
    const numId = Number(id);
    if (db.isMysql()) {
      const pool = db.getPool();
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(data)) {
        if (key !== 'id' && key !== 'codigo_interno' && key !== 'creado_en') {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) return await this.findById(numId);

      values.push(numId);
      await pool.query(`UPDATE beneficiarios SET ${fields.join(', ')} WHERE id = ?`, values);
      return await this.findById(numId);
    } else {
      const local = db.getLocalDb();
      const idx = local.beneficiarios.findIndex(b => b.id === numId);
      if (idx === -1) return null;

      const existing = local.beneficiarios[idx];
      local.beneficiarios[idx] = {
        ...existing,
        ...data,
        id: existing.id,
        codigo_interno: existing.codigo_interno,
        actualizado_en: new Date().toISOString()
      };
      db.saveLocalDb(local);
      return new Beneficiary(local.beneficiarios[idx]);
    }
  }

  // Ficha única consolidada: reúne datos personales, familiares, programas, atenciones y seguimientos
  async getConsolidatedFile(id) {
    const beneficiary = await this.findById(id);
    if (!beneficiary) return null;

    if (db.isMysql()) {
      const pool = db.getPool();
      const [familiares] = await pool.query('SELECT * FROM familiares WHERE beneficiario_id = ?', [beneficiary.id]);
      const [participaciones] = await pool.query(
        `SELECT p.*, prog.nombre as programa_nombre, prog.codigo as programa_codigo, prog.linea_trabajo
         FROM participaciones p
         JOIN programas prog ON p.programa_id = prog.id
         WHERE p.beneficiario_id = ? ORDER BY p.fecha_vinculacion DESC`,
        [beneficiary.id]
      );
      const [atenciones] = await pool.query(
        `SELECT a.*, prog.nombre as programa_nombre
         FROM atenciones a
         LEFT JOIN programas prog ON a.programa_id = prog.id
         WHERE a.beneficiario_id = ? ORDER BY a.fecha_atencion DESC`,
        [beneficiary.id]
      );
      const [seguimientos] = await pool.query(
        'SELECT * FROM seguimientos WHERE beneficiario_id = ? ORDER BY fecha_seguimiento DESC',
        [beneficiary.id]
      );

      beneficiary.familiares = familiares;
      beneficiary.participaciones = participaciones;
      beneficiary.atenciones = atenciones;
      beneficiary.seguimientos = seguimientos;
      return beneficiary;
    } else {
      const local = db.getLocalDb();
      beneficiary.familiares = local.familiares.filter(f => f.beneficiario_id === beneficiary.id);
      
      beneficiary.participaciones = local.participaciones
        .filter(p => p.beneficiario_id === beneficiary.id)
        .map(p => {
          const prog = local.programas.find(pr => pr.id === p.programa_id) || {};
          return {
            ...p,
            programa_nombre: prog.nombre || 'Programa General',
            programa_codigo: prog.codigo || 'R1',
            linea_trabajo: prog.linea_trabajo || 'Línea de Intervención'
          };
        });

      beneficiary.atenciones = local.atenciones
        .filter(a => a.beneficiario_id === beneficiary.id)
        .map(a => {
          const prog = local.programas.find(pr => pr.id === a.programa_id) || {};
          return {
            ...a,
            programa_nombre: prog.nombre || null
          };
        });

      beneficiary.seguimientos = local.seguimientos.filter(s => s.beneficiario_id === beneficiary.id);
      return beneficiary;
    }
  }
}
