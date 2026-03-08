-- =====================================================
-- Migración: Métricas y Proyectos
-- Versión: v1.6.0
-- Fecha: Marzo 2026
-- Descripción: Nuevas tablas para métricas manuales,
--              proyectos, hitos y documentos adjuntos
-- =====================================================

-- =====================================================
-- 1. Métricas manuales
-- =====================================================
CREATE TABLE IF NOT EXISTS `metricas_manuales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` enum('notas_enviadas','reuniones_capacitaciones','consultas_atendidas') NOT NULL,
  `anio` int(4) NOT NULL,
  `mes` int(2) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tipo_periodo` (`tipo`, `anio`, `mes`),
  KEY `idx_metricas_periodo` (`anio`, `mes`),
  KEY `idx_metricas_tipo` (`tipo`),
  CONSTRAINT `fk_metricas_usuario` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. Proyectos
-- =====================================================
CREATE TABLE IF NOT EXISTS `proyectos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('en_curso','completado','suspendido','idea') NOT NULL DEFAULT 'idea',
  `fecha_inicio` date DEFAULT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#3b82f6',
  `responsable` varchar(150) DEFAULT NULL,
  `enlace_externo` varchar(500) DEFAULT NULL,
  `prioridad` enum('alta','media','baja') NOT NULL DEFAULT 'media',
  `categoria` enum('tecnologia','normativa','difusion') NOT NULL DEFAULT 'tecnologia',
  `activo` tinyint(1) DEFAULT 1,
  `orden` int(11) DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_proyectos_estado` (`estado`),
  KEY `idx_proyectos_categoria` (`categoria`),
  KEY `idx_proyectos_prioridad` (`prioridad`),
  KEY `idx_proyectos_activo` (`activo`),
  CONSTRAINT `fk_proyectos_usuario` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. Relación proyectos-áreas
-- =====================================================
CREATE TABLE IF NOT EXISTS `proyecto_areas` (
  `proyecto_id` int(11) NOT NULL,
  `area_id` int(11) NOT NULL,
  PRIMARY KEY (`proyecto_id`, `area_id`),
  KEY `idx_proyecto_areas_area` (`area_id`),
  CONSTRAINT `fk_pa_proyecto` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pa_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. Documentos adjuntos de proyectos
-- =====================================================
CREATE TABLE IF NOT EXISTS `proyecto_documentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proyecto_id` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pd_proyecto` (`proyecto_id`),
  CONSTRAINT `fk_pd_proyecto` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. Hitos de proyectos
-- =====================================================
CREATE TABLE IF NOT EXISTS `proyecto_hitos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proyecto_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` text DEFAULT NULL,
  `evidencia_tipo` enum('archivo','url','ninguno') DEFAULT 'ninguno',
  `evidencia_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ph_proyecto` (`proyecto_id`),
  KEY `idx_ph_fecha` (`fecha`),
  CONSTRAINT `fk_ph_proyecto` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
