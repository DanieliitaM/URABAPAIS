import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { db as excelDb, excelStorage, initExcelStorage } from './excelDb.js';

dotenv.config();

let pool = null;
let mysqlActivo = false;

// Conecta a MySQL; si no se puede, usa el archivo Excel como respaldo
export const initDatabase = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      dateStrings: true, // fechas como texto 'AAAA-MM-DD', sin desfase de zona horaria
      waitForConnections: true,
      connectionLimit: 10
    });
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    mysqlActivo = true;
    console.log(`✅ [MySQL] Conectado a ${process.env.DB_NAME} en ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
  } catch (err) {
    mysqlActivo = false;
    console.error(`❌ [MySQL] No se pudo conectar: ${err.message}`);
    console.warn('⚠️  Usando el archivo Excel como respaldo.');
    initExcelStorage();
  }
};

export const db = {
  isMysql: () => mysqlActivo,
  getPool: () => pool,
  // Interfaz del modo Excel (solo se usa si MySQL no está disponible)
  isExcelMode: () => !mysqlActivo,
  getStore: () => excelDb.getStore(),
  saveStore: () => excelDb.saveStore(),
  getLocalDb: () => excelDb.getLocalDb(),
  saveLocalDb: (data) => excelDb.saveLocalDb(data)
};

export { excelStorage };