-- =====================================================================
-- ESQUEMA DE BASE DE DATOS MYSQL: PROYECTO URABÁ-PAÍS
-- Alianza: COOPI, FADV, HIAS Colombia, Humanity & Inclusion (HI)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS uraba_pais_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE uraba_pais_db;

-- 1. TABLA BENEFICIARIOS
CREATE TABLE IF NOT EXISTS beneficiarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_interno VARCHAR(50) NOT NULL UNIQUE,
  tipo_documento VARCHAR(50) NULL,
  numero_documento VARCHAR(50) NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  sexo VARCHAR(30) NULL,
  edad INT NULL,
  fecha_nacimiento DATE NULL,
  telefono VARCHAR(50) NULL,
  correo VARCHAR(150) NULL,
  municipio VARCHAR(100) NOT NULL,
  zona VARCHAR(50) DEFAULT 'Urbana',
  direccion VARCHAR(255) NULL,
  nacionalidad VARCHAR(100) DEFAULT 'Colombiana',
  tipo_poblacion VARCHAR(100) NULL,
  organizacion_responsable VARCHAR(100) DEFAULT 'COOPI',
  tiene_discapacidad TINYINT(1) DEFAULT 0,
  tipo_discapacidad VARCHAR(100) NULL,
  autorizacion_datos TINYINT(1) NOT NULL DEFAULT 1,
  fecha_autorizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_registro DATE NOT NULL,
  estado_general VARCHAR(50) DEFAULT 'Activo',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_documento (tipo_documento, numero_documento),
  INDEX idx_municipio (municipio),
  INDEX idx_codigo (codigo_interno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA FAMILIARES (NÚCLEO FAMILIAR)
CREATE TABLE IF NOT EXISTS familiares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiario_id INT NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  parentesco VARCHAR(100) NOT NULL,
  edad INT NULL,
  tipo_documento VARCHAR(50) NULL,
  numero_documento VARCHAR(50) NULL,
  observaciones TEXT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id) ON DELETE CASCADE,
  INDEX idx_familiar_beneficiario (beneficiario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA PROGRAMAS Y LÍNEAS DE INTERVENCIÓN
CREATE TABLE IF NOT EXISTS programas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  linea_trabajo VARCHAR(255) NOT NULL,
  meta_estimada INT DEFAULT 0,
  organizacion_lider VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  activo TINYINT(1) DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA PARTICIPACIONES (VINCULACIÓN BENEFICIARIO - PROGRAMA)
CREATE TABLE IF NOT EXISTS participaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiario_id INT NOT NULL,
  programa_id INT NOT NULL,
  fecha_vinculacion DATE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Inscrito',
  motivo_cambio TEXT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id) ON DELETE CASCADE,
  FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE RESTRICT,
  INDEX idx_part_beneficiario (beneficiario_id),
  INDEX idx_part_programa (programa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA ATENCIONES O AYUDAS ENTREGADAS
CREATE TABLE IF NOT EXISTS atenciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiario_id INT NOT NULL,
  programa_id INT NULL,
  fecha_atencion DATE NOT NULL,
  tipo_atencion_ayuda VARCHAR(100) NOT NULL,
  actividad_recibida VARCHAR(255) NULL,
  resultado_asociado VARCHAR(50) NULL,
  descripcion TEXT NOT NULL,
  organizacion VARCHAR(100) NOT NULL,
  responsable VARCHAR(150) NULL,
  resultado VARCHAR(100) NOT NULL DEFAULT 'Atendido',
  remitido_a VARCHAR(150) NULL,
  observaciones TEXT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id) ON DELETE CASCADE,
  FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE SET NULL,
  INDEX idx_atencion_beneficiario (beneficiario_id),
  INDEX idx_atencion_resultado (resultado_asociado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA SEGUIMIENTOS (AVANCE, NOVEDAD Y PRÓXIMA ACCIÓN)
CREATE TABLE IF NOT EXISTS seguimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiario_id INT NOT NULL,
  fecha_seguimiento DATE NOT NULL,
  avance_novedad TEXT NOT NULL,
  observacion TEXT NULL,
  estado_caso VARCHAR(50) DEFAULT 'En seguimiento',
  accion_pendiente TEXT NULL,
  proximo_contacto DATE NULL,
  responsable VARCHAR(150) NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id) ON DELETE CASCADE,
  INDEX idx_seg_beneficiario (beneficiario_id),
  INDEX idx_seg_estado (estado_caso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLA USUARIOS (ROLES Y PERMISOS)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'Funcionario',
  organizacion VARCHAR(100) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
