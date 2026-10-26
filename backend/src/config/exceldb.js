import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
// Rutas a archivos de Excel y persistencia
const rootDir = path.resolve(__dirname, '../../..');
const excelFilePath = path.join(rootDir, 'Base_Beneficiarios_Hackathon.xlsx');
const localDataPath = path.join(__dirname, '../data/excel_store.json');
 
let store = {
  beneficiarios: [],
  familiares: [],
  programas: [],
  participaciones: [],
  atenciones: [],
  seguimientos: [],
  meta: {
    fuente: 'Base_Beneficiarios_Hackathon.xlsx',
    cargado_en: null,
    total_filas_excel: 0
  }
};
 
const formatDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
    // Fecha número serie de Excel
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().slice(0, 10);
  }
  if (typeof val === 'string' && val.trim().length >= 10) {
    return val.slice(0, 10);
  }
  return String(val);
};
 
export const initExcelStorage = () => {
  console.log('📂 [Excel Engine] Inicializando almacenamiento directo desde archivo Excel...');
 
  // Si ya existe datos guardados en la sesión, los usamos; si no, leemos el Excel
  if (fs.existsSync(localDataPath)) {
    try {
      store = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
      console.log(`✅ [Excel Engine] ${store.beneficiarios.length} beneficiarios cargados desde persistencia local de Excel.`);
      return;
    } catch (e) {
      console.warn('Leyendo archivo Excel original directamente...');
    }
  }
 
  if (!fs.existsSync(excelFilePath)) {
    console.error(`❌ No se encontró el archivo Excel en: ${excelFilePath}`);
    return;
  }
 
  const workbook = XLSX.readFile(excelFilePath);
  const sheetNames = workbook.SheetNames;
  console.log(`📑 Hojas encontradas en Excel: ${sheetNames.join(', ')}`);
 
  // 1. Programas desde REFERENCIA_RESULTADOS o predeterminados
  store.programas = [
    {
      id: 1,
      codigo: 'R1',
      nombre: 'Asistencia Humanitaria y Protección',
      linea_trabajo: 'Asistencia humanitaria y protección',
      meta_estimada: 6700,
      organizacion_lider: 'COOPI',
      descripcion: 'Entrega de kits higiénicos, kits de dignidad, kits alimentarios, fondos de emergencia y respuesta inmediata.',
      activo: 1
    },
    {
      id: 2,
      codigo: 'R2',
      nombre: 'Salud y Bienestar Integral',
      linea_trabajo: 'Salud y bienestar',
      meta_estimada: 2911,
      organizacion_lider: 'FADV',
      descripcion: 'Atención médica primaria, primeros auxilios psicológicos, salud mental comunitaria y salud sexual y reproductiva.',
      activo: 1
    },
    {
      id: 3,
      codigo: 'R3',
      nombre: 'Integración Socioeconómica y Cohesión',
      linea_trabajo: 'Integración socioeconómica y cohesión social',
      meta_estimada: 1836,
      organizacion_lider: 'HIAS Colombia',
      descripcion: 'Formación para la empleabilidad, inclusión laboral, fortalecimiento asociativo y microemprendimientos.',
      activo: 1
    }
  ];
 
  // 2. Beneficiarios desde BASE_BENEFICIARIOS
  const baseSheetName = sheetNames.find(n => n.toUpperCase().includes('BENEFICIARIOS')) || sheetNames[1] || sheetNames[0];
  const worksheet = workbook.Sheets[baseSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet);
 
  console.log(`📊 Total registros leídos de la hoja ${baseSheetName}: ${rawRows.length}`);
 
  const programIdByResultado = { 'R1': 1, 'R2': 2, 'R3': 3 };
 
  rawRows.forEach((row, index) => {
    const benId = index + 1;
    const codigoInterno = row.ID_Beneficiario || `BEN-${String(benId).padStart(3, '0')}`;
    const fechaReg = formatDate(row.Fecha_registro) || '2026-01-15';
    const fechaAtencion = formatDate(row.Fecha_atencion) || fechaReg;
    const resultadoAsociado = row.Resultado_asociado || 'R1';
    const progId = programIdByResultado[resultadoAsociado] || 1;
 
    // Beneficiario único
    store.beneficiarios.push({
      id: benId,
      codigo_interno: codigoInterno,
      tipo_documento: row.Tipo_documento || 'CC/Documento',
      numero_documento: row.Numero_documento_ficticio || `FIC-${200000 + benId}`,
      nombre_completo: row.Nombre_completo || `Beneficiario ${benId}`,
      sexo: row.Sexo || 'Mujer',
      edad: row.Edad ? Number(row.Edad) : 32,
      fecha_nacimiento: null,
      telefono: '310' + Math.floor(1000000 + Math.random() * 9000000),
      correo: null,
      municipio: row.Municipio || 'Apartadó',
      zona: row.Zona || 'Urbana',
      direccion: 'Sector Comunitario Urabá',
      nacionalidad: row.Nacionalidad || 'Colombiana',
      tipo_poblacion: row.Tipo_poblacion || 'Comunidad de acogida',
      organizacion_responsable: row.Organización || 'COOPI',
      tiene_discapacidad: 0,
      tipo_discapacidad: null,
      autorizacion_datos: 1,
      fecha_autorizacion: '2026-01-10 09:00:00',
      fecha_registro: fechaReg,
      estado_general: 'Activo',
      creado_en: fechaReg
    });
 
    // Familiar dependiente de muestra para los primeros 35
    if (benId <= 35) {
      store.familiares.push({
        id: store.familiares.length + 1,
        beneficiario_id: benId,
        nombre_completo: `Familiar de ${(row.Nombre_completo || '').split(' ')[0]}`,
        parentesco: benId % 2 === 0 ? 'Hijo/a' : 'Cónyuge/Pareja',
        edad: benId % 2 === 0 ? 8 : 34,
        tipo_documento: benId % 2 === 0 ? 'TI' : 'CC/Documento',
        numero_documento: `FAM-${300000 + benId}`,
        observaciones: 'Núcleo familiar conviviente.',
        creado_en: fechaReg
      });
    }
 
    // Participación en programa
    store.participaciones.push({
      id: store.participaciones.length + 1,
      beneficiario_id: benId,
      programa_id: progId,
      fecha_vinculacion: fechaReg,
      estado: row.Estado === 'Atendido' ? 'En proceso' : (row.Estado || 'Inscrito'),
      motivo_cambio: null,
      creado_en: fechaReg
    });
 
    // Atención o ayuda entregada
    if (row.Actividad_recibida) {
      store.atenciones.push({
        id: store.atenciones.length + 1,
        beneficiario_id: benId,
        programa_id: progId,
        fecha_atencion: fechaAtencion,
        tipo_atencion_ayuda: row.Tipo_atencion_ayuda || 'Ayuda',
        actividad_recibida: row.Actividad_recibida,
        resultado_asociado: resultadoAsociado,
        descripcion: row.Actividad_recibida,
        organizacion: row.Organización || 'COOPI',
        responsable: `${row.Organización || 'COOPI'} - Equipo de Campo`,
        resultado: row.Estado || 'Atendido',
        remitido_a: null,
        observaciones: row.Observaciones || 'Atención registrada con éxito.',
        creado_en: fechaAtencion
      });
    }
 
    // Seguimientos y novedades (para casos que lo requieren según la base)
    if (row.Estado === 'En seguimiento' || row.Estado === 'Pendiente' || benId % 3 === 0) {
      store.seguimientos.push({
        id: store.seguimientos.length + 1,
        beneficiario_id: benId,
        fecha_seguimiento: fechaAtencion,
        avance_novedad: 'Visita de seguimiento y verificación de recepción del beneficio.',
        observacion: row.Observaciones || 'Caso activo con necesidad de próxima llamada.',
        estado_caso: row.Estado === 'Pendiente' ? 'Pendiente' : 'En seguimiento',
        accion_pendiente: 'Contactar telefónicamente para verificar uso de insumos o agendar cita de salud.',
        proximo_contacto: '2026-02-25',
        responsable: `${row.Organización || 'COOPI'} - Enlace Social`,
        creado_en: fechaAtencion
      });
    }
  });
 
  store.meta = {
    fuente: 'Base_Beneficiarios_Hackathon.xlsx',
    cargado_en: new Date().toISOString(),
    total_filas_excel: rawRows.length
  };
 
  saveStore();
  console.log(`✅ [Excel Engine] ${store.beneficiarios.length} beneficiarios procesados y listos en memoria.`);
};
 
const saveStore = () => {
  try {
    const dir = path.dirname(localDataPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localDataPath, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('Error guardando en archivo local:', e.message);
  }
};
 
// Motor de almacenamiento exportado para los repositorios
export const excelStorage = {
  getStore: () => store,
  saveStore,
  getBeneficiarios: () => store.beneficiarios,
  getFamiliares: () => store.familiares,
  getProgramas: () => store.programas,
  getParticipaciones: () => store.participaciones,
  getAtenciones: () => store.atenciones,
  getSeguimientos: () => store.seguimientos,
  getMeta: () => store.meta
};
 
// Compatibilidad con la interfaz db
export const db = {
  isMysql: () => false,
  isExcelMode: () => true,
  getStore: () => store,
  saveStore,
  getLocalDb: () => store,
  saveLocalDb: (data) => {
    store = data;
    saveStore();
  }
};
 
export const initDatabase = initExcelStorage;
 