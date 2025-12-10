-- =================================================================
-- MIGRACIÓN ACUMULADA: RPAD v1.3.0 → v1.4.0
-- Incluye:
-- 1. Sistema de Formatos Many-to-Many
-- 2. Sistema de roles de usuario (admin/lector)
-- =================================================================

START TRANSACTION;

-- =================================================================
-- PARTE 1: GESTIÓN DE FORMATOS
-- =================================================================

-- 1. Crear tabla de formatos
CREATE TABLE IF NOT EXISTS `formatos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(50) NOT NULL UNIQUE,
  `habitual` TINYINT(1) DEFAULT 0,
  `extension` VARCHAR(20),
  `tipo_mime` VARCHAR(100),
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Insertar catálogo de formatos (Usamos IGNORE para evitar errores si ya existen)
INSERT IGNORE INTO `formatos` (`nombre`, `habitual`, `extension`, `tipo_mime`) VALUES
-- Habituales (10)
('CSV', 1, '.csv', 'text/csv'),
('XLSX', 1, '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
('XLS', 1, '.xls', 'application/vnd.ms-excel'),
('PDF', 1, '.pdf', 'application/pdf'),
('KML', 1, '.kml', 'application/vnd.google-earth.kml+xml'),
('KMZ', 1, '.kmz', 'application/vnd.google-earth.kmz'),
('SHP', 1, '.shp', 'application/x-shapefile'),
('JSON', 1, '.json', 'application/json'),
('XML', 1, '.xml', 'application/xml'),
('DOC', 1, '.doc', 'application/msword'),
-- No habituales (17)
('DOCX', 0, '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
('GeoJSON', 0, '.geojson', 'application/geo+json'),
('GeoTIFF', 0, '.tif', 'image/tiff'),
('GPX', 0, '.gpx', 'application/gpx+xml'),
('DWG', 0, '.dwg', 'application/acad'),
('DXF', 0, '.dxf', 'application/dxf'),
('GDB', 0, '.gdb', 'application/x-filegdb'),
('GPKG', 0, '.gpkg', 'application/geopackage+sqlite3'),
('WKT', 0, '.wkt', 'text/plain'),
('Markdown', 0, '.md', 'text/markdown'),
('Texto plano', 0, '.txt', 'text/plain'),
('HTML', 0, '.html', 'text/html'),
('ODS', 0, '.ods', 'application/vnd.oasis.opendocument.spreadsheet'),
('ODT', 0, '.odt', 'application/vnd.oasis.opendocument.text'),
('ZIP', 0, '.zip', 'application/zip'),
('RAR', 0, '.rar', 'application/vnd.rar'),
('7Z', 0, '.7z', 'application/x-7z-compressed');

-- 3. Crear tabla de relación
CREATE TABLE IF NOT EXISTS `dataset_formatos` (
  `dataset_id` INT NOT NULL,
  `formato_id` INT NOT NULL,
  PRIMARY KEY (`dataset_id`, `formato_id`),
  FOREIGN KEY (`dataset_id`) REFERENCES `datasets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`formato_id`) REFERENCES `formatos`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Migrar datos existentes
-- 4.1 Migrar formato_primario
INSERT IGNORE INTO `dataset_formatos` (`dataset_id`, `formato_id`)
SELECT d.id, f.id
FROM `datasets` d
JOIN `formatos` f ON UPPER(TRIM(d.formato_primario)) = UPPER(f.nombre)
WHERE d.formato_primario IS NOT NULL 
  AND d.formato_primario != ''
  AND d.activo = TRUE;

-- 4.2 Migrar formato_secundario
INSERT IGNORE INTO `dataset_formatos` (`dataset_id`, `formato_id`)
SELECT d.id, f.id
FROM `datasets` d
JOIN `formatos` f ON UPPER(TRIM(d.formato_secundario)) = UPPER(f.nombre)
WHERE d.formato_secundario IS NOT NULL 
  AND d.formato_secundario != ''
  AND d.activo = TRUE;

-- =================================================================
-- PARTE 2: ROLES DE USUARIO
-- =================================================================

-- Agregar columna rol a la tabla usuarios
-- Nota: Si esto falla porque la columna ya existe, toda la transacción se revertirá.
ALTER TABLE `usuarios` 
ADD COLUMN `rol` ENUM('admin', 'lector') NOT NULL DEFAULT 'admin' 
AFTER `email`;

-- =================================================================
-- FINALIZACIÓN
-- =================================================================

-- Si llegamos aquí sin errores, guardamos los cambios.
COMMIT;

-- Opcional: Limpieza (Descomentar solo si se está seguro de borrar datos antiguos)
ALTER TABLE `datasets` DROP COLUMN `formato_primario`;
ALTER TABLE `datasets` DROP COLUMN `formato_secundario`;
