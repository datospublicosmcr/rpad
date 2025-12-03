-- =====================================================
-- RPAD - Registro Permanente de Actualización de Datos
-- Municipalidad de Comodoro Rivadavia
-- Base de datos MySQL
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
-- Datos de ejemplo: Datasets (basados en el CSV proporcionado)
-- =====================================================
INSERT INTO datasets (titulo, descripcion, area_responsable, frecuencia_id, formato_primario, formato_secundario, ultima_actualizacion, proxima_actualizacion, tema_principal_id, tema_secundario_id, url_dataset, observaciones) VALUES
(
    'Presupuesto Municipal',
    'Presupuesto de gastos de la Municipalidad de Comodoro Rivadavia discriminado por jurisdicción y tipo de gasto. Cumple con las obligaciones de transparencia activa establecidas en el Artículo 6° de la Ordenanza N° 17.662/23 sobre Gobierno Abierto para garantizar el acceso ciudadano a información presupuestaria, facilitar el control sobre el destino de los fondos públicos y fortalecer la rendición de cuentas de la gestión municipal.',
    'Secretaría de Economía, Finanzas y Control de Gestión',
    6, -- Anualmente
    'CSV',
    'XLSX',
    '2025-01-25',
    '2026-03-01',
    1, -- Economía y Finanzas
    NULL,
    'https://datos.comodoro.gov.ar/dataset/presupuesto-municipal',
    NULL
),
(
    'Gasto Público',
    'Registro de ejecución del gasto público de la Municipalidad de Comodoro Rivadavia discriminado por jurisdicción y categoría de gasto que incluye personal, funcionamiento, transferencias, obras públicas, bienes de capital, deuda, higiene urbana y otros rubros. Cumple con obligaciones de transparencia activa según Ordenanza N° 17.662/23 para garantizar control ciudadano sobre destino efectivo de fondos públicos y rendición de cuentas municipal.',
    'Secretaría de Economía, Finanzas y Control de Gestión',
    5, -- Cada medio año (Semestral)
    'CSV',
    'XLSX',
    '2025-07-13',
    '2026-03-01',
    1, -- Economía y Finanzas
    NULL,
    'https://datos.comodoro.gov.ar/dataset/gasto-publico',
    NULL
),
(
    'Funcionarios Públicos',
    'Nómina oficial de funcionarios de planta política del Poder Ejecutivo Municipal de Comodoro Rivadavia al 30 de junio de cada año, que incluye Intendente, Viceintendente, Secretarios, Subsecretarios y Coordinadores. Datos organizados por secretaría, sector y cargo para transparentar la estructura de conducción gubernamental, garantizar el derecho de acceso a la información pública conforme a la Ordenanza N° 17.662/23 y facilitar el control ciudadano.',
    'Dirección General de Recursos Humanos',
    5, -- Cada medio año (Semestral)
    'CSV',
    'XLSX',
    '2025-07-01',
    '2026-03-01',
    4, -- Gobierno y Gestión Pública
    NULL,
    'https://datos.comodoro.gov.ar/dataset/funcionarios-publicos',
    NULL
),
(
    'Castraciones de Animales',
    'Serie estadística mensual de castraciones quirúrgicas realizadas por la Dirección General de Veterinaria de la Municipalidad de Comodoro Rivadavia. El dataset registra intervenciones discriminadas por especie (caninos y felinos) y sexo (macho y hembra). La información permite analizar la demanda del servicio, evaluar cobertura territorial, identificar patrones estacionales y realizar planificación de recursos sanitarios. Los datos constituyen un insumo para políticas de salud pública preventiva.',
    'Dirección General de Veterinaria',
    6, -- Anualmente
    'CSV',
    'XLSX',
    '2025-02-13',
    '2026-03-01',
    8, -- Población y Sociedad
    NULL,
    'https://datos.comodoro.gov.ar/dataset/castraciones-de-animales',
    NULL
),
(
    'Obra Pública',
    'Registro de obras públicas ejecutadas en Comodoro Rivadavia, con información sobre procesos de contratación, empresas adjudicatarias y montos involucrados. Incluye datos de licitaciones públicas, concursos privados de precios y contrataciones directas, entre otros tipos de contratación, con detalle de presupuesto oficial y monto del contrato.',
    'Secretaría de Infraestructura, Obras y Servicios Públicos',
    5, -- Cada medio año (Semestral)
    'CSV',
    'XLSX',
    '2025-07-15',
    '2026-03-01',
    4, -- Gobierno y Gestión Pública
    5, -- Infraestructura y Equipamiento Urbano
    'https://datos.comodoro.gov.ar/dataset/obra-publica',
    NULL
);

-- =====================================================
-- Índices para optimización de consultas
-- =====================================================
CREATE INDEX idx_datasets_tema_principal ON datasets(tema_principal_id);
CREATE INDEX idx_datasets_tema_secundario ON datasets(tema_secundario_id);
CREATE INDEX idx_datasets_frecuencia ON datasets(frecuencia_id);
CREATE INDEX idx_datasets_proxima_actualizacion ON datasets(proxima_actualizacion);
CREATE INDEX idx_datasets_activo ON datasets(activo);
CREATE INDEX idx_historial_dataset ON historial_actualizaciones(dataset_id);
