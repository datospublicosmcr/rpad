-- =================================================================
-- MIGRACIÓN ACUMULADA: RPAD v1.4.0 → v1.5.0
-- Fecha: 2026-02-06
-- Incluye:
-- 1. Artículos gramaticales en tabla areas (el/la)
-- 2. Sistema de doble verificación (cambios_pendientes)
-- =================================================================

START TRANSACTION;

-- =================================================================
-- PARTE 1: ARTÍCULOS GRAMATICALES EN ÁREAS
-- =================================================================
-- Contexto: Permite que el sistema muestre correctamente
-- "el Banco Central" vs "la Dirección de..." en las vistas públicas.

-- 1.1 Agregar columna articulo al nombre del área
ALTER TABLE `areas`
ADD COLUMN `articulo` ENUM('el','la') NOT NULL DEFAULT 'la'
AFTER `nombre`;

-- 1.2 Agregar columna articulo_superior al área superior
ALTER TABLE `areas`
ADD COLUMN `articulo_superior` ENUM('el','la') DEFAULT 'la'
AFTER `area_superior`;

-- 1.3 Poblar artículos para áreas que usan "el" (el resto queda con 'la' por defecto)
UPDATE `areas` SET `articulo` = 'el' WHERE `nombre` IN (
  'Banco Central de la República Argentina',
  'Ente Autárquico Comodoro Deportes',
  'Ente Autárquico Comodoro Turismo',
  'Honorable Concejo Deliberante de Comodoro Rivadavia',
  'Instituto Geográfico Nacional de la República Argentina',
  'Instituto Nacional de Estadística y Censos de la República Argentina',
  'Ministerio de Educación del Chubut',
  'Tribunal Electoral del Chubut'
);

-- 1.4 Poblar artículo superior para áreas cuyo superior usa "el"
UPDATE `areas` SET `articulo_superior` = 'el' WHERE `nombre` = 'Ministerio de Educación del Chubut';
-- (El resto de area_superior usa 'la': "la Subsec...", "la Sec...", "la Intendencia")

-- =================================================================
-- PARTE 2: SISTEMA DE DOBLE VERIFICACIÓN
-- =================================================================
-- Contexto: Implementa el flujo donde un operador propone un cambio
-- y un segundo operador lo aprueba o rechaza. Preparatorio para
-- la integración blockchain (v1.6), donde cada aprobación generará
-- un sellado en la BFA.

-- 2.1 Crear tabla cambios_pendientes
CREATE TABLE IF NOT EXISTS `cambios_pendientes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tipo_cambio` ENUM('crear','editar','eliminar') NOT NULL,
  `dataset_id` INT(11) DEFAULT NULL COMMENT 'NULL cuando tipo_cambio=crear (el dataset aún no existe)',
  `datos_nuevos` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
    CHECK (JSON_VALID(`datos_nuevos`)),
  `datos_anteriores` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
    CHECK (JSON_VALID(`datos_anteriores`)),
  `usuario_id` INT(11) NOT NULL COMMENT 'Quien propone el cambio',
  `estado` ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `revisor_id` INT(11) DEFAULT NULL COMMENT 'Quien aprueba o rechaza',
  `comentario_rechazo` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `revisado_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_usuario` (`usuario_id`),
  KEY `idx_dataset` (`dataset_id`),
  KEY `idx_created` (`created_at`),
  KEY `revisor_id` (`revisor_id`),
  CONSTRAINT `cambios_pendientes_ibfk_1`
    FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cambios_pendientes_ibfk_2`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cambios_pendientes_ibfk_3`
    FOREIGN KEY (`revisor_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================
-- FINALIZACIÓN
-- =================================================================

-- Si llegamos aquí sin errores, guardamos los cambios.
COMMIT;

-- =================================================================
-- VERIFICACIÓN POST-MIGRACIÓN (ejecutar manualmente para confirmar)
-- =================================================================
-- SELECT 'areas.articulo' AS verificacion, COUNT(*) AS total,
--        SUM(articulo='el') AS con_el, SUM(articulo='la') AS con_la
-- FROM areas;
--
-- DESCRIBE cambios_pendientes;
--
-- SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
-- FROM information_schema.KEY_COLUMN_USAGE
-- WHERE TABLE_NAME = 'cambios_pendientes'
--   AND REFERENCED_TABLE_NAME IS NOT NULL;
