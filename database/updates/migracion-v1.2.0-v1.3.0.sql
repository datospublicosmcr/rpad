-- ============================================
-- MIGRACIÓN: Gestión de Áreas y Notificaciones
-- RPAD v1.2.0 → v1.3.0
-- ============================================

-- 1. Crear tabla de áreas (Estructura completa real)
CREATE TABLE IF NOT EXISTS `areas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `area_superior` varchar(300) DEFAULT NULL,
  `email_principal` varchar(150) DEFAULT NULL,
  `email_secundario` varchar(150) DEFAULT NULL,
  `telefono_area` varchar(50) DEFAULT NULL,
  `celular_area` varchar(50) DEFAULT NULL,
  `nombre_contacto` varchar(150) DEFAULT NULL,
  `telefono_contacto` varchar(50) DEFAULT NULL,
  `email_contacto` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_unique` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Migrar áreas existentes desde datasets (Normalización)
-- Se toman los nombres únicos de la columna 'area_responsable' antigua
INSERT IGNORE INTO `areas` (`nombre`)
SELECT DISTINCT `area_responsable` 
FROM `datasets` 
WHERE `area_responsable` IS NOT NULL AND `area_responsable` != '';

-- 3. Agregar columna area_id a datasets (Foreign Key)
-- Se verifica si la columna existe antes de agregarla (para evitar errores al re-ejecutar)
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'datasets' AND COLUMN_NAME = 'area_id' AND TABLE_SCHEMA = DATABASE());
SET @sql := IF (@exist = 0, 'ALTER TABLE `datasets` ADD COLUMN `area_id` INT DEFAULT NULL AFTER `descripcion`;', 'SELECT "Columna area_id ya existe";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar la constraint de clave foránea
SET @exist_fk := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'datasets' AND CONSTRAINT_NAME = 'fk_datasets_area' AND TABLE_SCHEMA = DATABASE());
SET @sql_fk := IF (@exist_fk = 0, 'ALTER TABLE `datasets` ADD CONSTRAINT `fk_datasets_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`);', 'SELECT "Constraint fk_datasets_area ya existe";');
PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- 4. Vincular datasets con las nuevas áreas creadas
-- Esto asume que la columna 'area_responsable' todavía existe en datasets
UPDATE `datasets` d 
JOIN `areas` a ON d.`area_responsable` = a.`nombre` 
SET d.`area_id` = a.`id`
WHERE d.`area_id` IS NULL;

-- 5. Crear tabla de log de notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` enum('interno-60','interno-30','interno-vencido','externo-60','externo-40','externo-5','externo-vencido','area-aviso-40') NOT NULL,
  `area_id` int(11) DEFAULT NULL COMMENT 'NULL para notificaciones internas a DGMIT',
  `destinatarios` varchar(500) NOT NULL,
  `datasets_ids` varchar(500) NOT NULL COMMENT 'IDs separados por coma',
  `cantidad_datasets` int(11) NOT NULL DEFAULT 1,
  `enviado_at` timestamp NULL DEFAULT current_timestamp(),
  `success` tinyint(1) DEFAULT 1,
  `error_message` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notificaciones_tipo` (`tipo`),
  KEY `idx_notificaciones_area` (`area_id`),
  KEY `idx_notificaciones_fecha` (`enviado_at`),
  CONSTRAINT `notificaciones_log_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LIMPIEZA FINAL (Opcional - Ejecutar manualmente)
-- ============================================
-- ALTER TABLE `datasets` DROP COLUMN `area_responsable`;