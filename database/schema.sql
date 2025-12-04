-- =====================================================
-- RPAD - Registro Permanente de Actualización de Datos
-- Municipalidad de Comodoro Rivadavia
-- Base de datos MySQL
-- Versión: 1.1.0
-- =====================================================

-- Crear la base de datos (ejecutar como admin de MySQL)
-- CREATE DATABASE IF NOT EXISTS rpad_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE rpad_db;

-- =====================================================
-- Tabla: usuarios
-- Almacena los usuarios administradores del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabla: temas
-- Catálogo de temas para clasificación de datasets
-- =====================================================
CREATE TABLE IF NOT EXISTS temas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    icono VARCHAR(50),
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabla: frecuencias
-- Catálogo de frecuencias de actualización
-- =====================================================
CREATE TABLE IF NOT EXISTS frecuencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    dias INT NULL COMMENT 'Días entre actualizaciones. NULL para Eventual',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabla: datasets
-- Registro principal de datasets del portal
-- NOVEDAD v1.1.0: campo tipo_gestion para diferenciar
-- gestión interna (DGMIT) de externa (otras áreas)
-- =====================================================
CREATE TABLE IF NOT EXISTS datasets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    area_responsable VARCHAR(200) NOT NULL,
    frecuencia_id INT NOT NULL,
    formato_primario VARCHAR(20) NOT NULL,
    formato_secundario VARCHAR(20),
    ultima_actualizacion DATE,
    proxima_actualizacion DATE,
    tema_principal_id INT NOT NULL,
    tema_secundario_id INT,
    url_dataset VARCHAR(500),
    observaciones TEXT,
    tipo_gestion ENUM('interna', 'externa') NOT NULL DEFAULT 'externa' COMMENT 'interna=DGMIT gestiona, externa=depende de otra área',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (frecuencia_id) REFERENCES frecuencias(id),
    FOREIGN KEY (tema_principal_id) REFERENCES temas(id),
    FOREIGN KEY (tema_secundario_id) REFERENCES temas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabla: historial_actualizaciones
-- Log de actualizaciones realizadas a cada dataset
-- =====================================================
CREATE TABLE IF NOT EXISTS historial_actualizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataset_id INT NOT NULL,
    fecha_actualizacion DATE NOT NULL,
    usuario_id INT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Datos iniciales: Temas
-- =====================================================
INSERT INTO temas (nombre, icono, orden) VALUES
('Economía y Finanzas', 'coins', 1),
('Educación y Cultura', 'graduation-cap', 2),
('Geografía y Territorio', 'map', 3),
('Gobierno y Gestión Pública', 'landmark', 4),
('Infraestructura y Equipamiento Urbano', 'building', 5),
('Marco Legal, Elecciones y Seguridad', 'scale', 6),
('Medio Ambiente', 'leaf', 7),
('Población y Sociedad', 'users', 8),
('Salud, Género y Desarrollo Social', 'heart-pulse', 9),
('Servicios Públicos', 'wrench', 10),
('Transporte y Movilidad', 'bus', 11),
('Turismo y Deportes', 'plane', 12);

-- =====================================================
-- Datos iniciales: Frecuencias
-- =====================================================
INSERT INTO frecuencias (nombre, dias, orden) VALUES
('Mensualmente', 30, 1),
('Bimestralmente', 60, 2),
('Trimestralmente', 90, 3),
('Cuatrimestralmente', 120, 4),
('Cada medio año', 180, 5),
('Anualmente', 365, 6),
('Cada dos años', 730, 7),
('Cada tres años', 1095, 8),
('Cada cuatro años', 1460, 9),
('Cada diez años', 3650, 10),
('Eventual', NULL, 11);

-- =====================================================
-- Usuario administrador inicial
-- Password: Admin2024! (cambiar después del primer login)
-- El hash se debe generar con bcrypt en la aplicación
-- =====================================================
-- INSERT INTO usuarios (username, password_hash, nombre_completo, email) VALUES
-- ('admin', '$2b$10$HASH_GENERADO_POR_BCRYPT', 'Administrador RPAD', 'datospublicos@comodoro.gov.ar');

-- =====================================================
-- Índices para optimización de consultas
-- =====================================================
CREATE INDEX idx_datasets_tema_principal ON datasets(tema_principal_id);
CREATE INDEX idx_datasets_tema_secundario ON datasets(tema_secundario_id);
CREATE INDEX idx_datasets_frecuencia ON datasets(frecuencia_id);
CREATE INDEX idx_datasets_proxima_actualizacion ON datasets(proxima_actualizacion);
CREATE INDEX idx_datasets_activo ON datasets(activo);
CREATE INDEX idx_datasets_tipo_gestion ON datasets(tipo_gestion);
CREATE INDEX idx_historial_dataset ON historial_actualizaciones(dataset_id);
