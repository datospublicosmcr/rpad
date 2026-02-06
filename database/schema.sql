-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 06-02-2026 a las 13:34:43
-- Versión del servidor: 10.11.15-MariaDB-cll-lve-log
-- Versión de PHP: 8.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `datospublicos_mcr_rpad`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `articulo` enum('el','la') NOT NULL DEFAULT 'la',
  `area_superior` varchar(300) DEFAULT NULL,
  `articulo_superior` enum('el','la') DEFAULT 'la',
  `email_principal` varchar(150) DEFAULT NULL,
  `email_secundario` varchar(150) DEFAULT NULL,
  `telefono_area` varchar(50) DEFAULT NULL,
  `celular_area` varchar(50) DEFAULT NULL,
  `nombre_contacto` varchar(150) DEFAULT NULL,
  `telefono_contacto` varchar(50) DEFAULT NULL,
  `email_contacto` varchar(150) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`id`, `nombre`, `articulo`, `area_superior`, `articulo_superior`, `email_principal`, `email_secundario`, `telefono_area`, `celular_area`, `nombre_contacto`, `telefono_contacto`, `email_contacto`, `created_at`, `updated_at`) VALUES
(1, 'Agencia de Acceso a la Información Pública', 'la', 'Subsec. de Modernización y Transparencia. Sec. de Gobierno, Modernización y Transparencia', 'la', 'aip@comodoro.gov.ar', NULL, NULL, '297 5076480', NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-11 20:48:18'),
(2, 'Agencia Provincial de Seguridad Vial', 'la', 'Subsecretaría de Seguridad Vial. Ministerio de Seguridad. Provincia del Chubut', 'la', 'observatoriovialchubut@gmail.com', 'agenciaseguridadvial@gmail.com', '280 4484799', NULL, 'Gustavo Soto', NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 16:52:52'),
(3, 'Asociación de Bomberos Voluntarios de Comodoro Rivadavia', 'la', NULL, NULL, 'bomvolcomodoro@infovia.com.ar', NULL, '297 446-2222', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:49:16'),
(4, 'Banco Central de la República Argentina', 'el', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:49:21'),
(5, 'Dirección de Datos Públicos y Comunicación', 'la', 'Subsec. de Modernización y Transparencia. Sec. de Gobierno, Modernización y Transparencia', 'la', 'datospublicos@comodoro.gov.ar', 'marianoaperez@yahoo.com.ar', NULL, NULL, 'Mariano Ariel Perez', NULL, NULL, '2025-12-06 02:39:29', '2025-12-07 03:34:57'),
(6, 'Dirección de Estadística y Evaluación Educativa', 'la', 'Ministerio de Educación del Chubut', 'la', 'estadisticayevaluacion.edu@educacionvirtual.chubut.edu.ar', 'sc.estadisticas@chubut.edu.ar', NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-02-01 11:59:51'),
(7, 'Dirección de Patrimonio Cultural y Natural. D. G. de Gestión Interinstitucional y Patrimonial', 'la', 'Subsec. de Cultura. Sec. de Cultura', 'la', 'dirpatrimoniocultural@comodoro.gov.ar', NULL, '297 446-5152', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 16:22:14'),
(8, 'Dirección General de Asociaciones Vecinales', 'la', 'Sec. Gobierno, Modernización y Transparencia', 'la', 'vecinales@comodoro.gov.ar', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 16:22:59'),
(9, 'Dirección General de Catastro', 'la', 'Subsec. de Coordinación Económica y Control de Gestión', 'la', 'catastro@comodoro.gov.ar', NULL, '297 4115350', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-11 20:20:56'),
(10, 'Dirección General de Cultos', 'la', 'Subsecretaría de Modernización y Transparencia. Secretaría de Gobierno, Modernización y Transparencia', 'la', 'registrodeculto@comodoro.gov.ar', 'cultomcr@gmail.com', NULL, '2975299950', NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 23:42:30'),
(11, 'Dirección General de Gestión lntegral de Contribuyentes', 'la', 'Subsec. de Rentas. Sec. de Recaudación', 'la', NULL, NULL, '297 4757412', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-11 20:22:59'),
(12, 'Dirección General de Habilitaciones Comerciales', 'la', 'Subsec. de Fiscalización. Sec. de Control Urbano y Operativo', 'la', 'inspectoreshabilitacion@comodoro.gov.ar', NULL, '297 455-7522', '2974934316 / 2974174374', NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-11 20:26:35'),
(13, 'Dirección General de Higiene Urbana y Estrategias Urbano Ambientales', 'la', 'Sec. Gobierno, Modernización y Transparencia', 'la', 'dghigieneurbana@comodoro.gov.ar', 'generadoresespeciales24@gmail.com', NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 16:30:27'),
(14, 'Dirección General de Modernización e Investigación Territorial', 'la', 'Subsec. de Modernización y Transparencia. Sec. de Gobierno, Modernización y Transparencia', 'la', 'mit@comodoro.gov.ar', 'investigacionterritorial@comodoro.gov.ar', '297 596-2815', '2974056894', 'Gustavo López (DG)', NULL, 'galolopez@gmail.com', '2025-12-06 02:39:29', '2026-01-11 15:35:33'),
(15, 'Dirección General de Parques y Paseos', 'la', 'Sec. de Control Urbano y Operativo', 'la', NULL, NULL, '297 406-2372', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 23:37:58'),
(16, 'Dirección General de Promoción de Derechos para Personas con Discapacidad', 'la', 'Subsec. de Desarrollo Humano y Familia. Sec. de Desarrollo Humano y Familia', 'la', 'd.discapacidad@comodoro.gov.ar', NULL, '297 447-3270', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 23:34:49'),
(17, 'Dirección General de Promoción Social y Comunitaria', 'la', 'Subsec. de Desarrollo Humano y Familia. Sec. de Desarrollo Humano y Familia', 'la', NULL, NULL, '297 447-1623', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 23:35:54'),
(18, 'Dirección General de Recursos Humanos', 'la', 'Subsec. de Recursos Humanos. Sec. Gobierno, Modernización y Transparencia', 'la', 'adicionales@comodoro.gov.ar', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 02:39:29'),
(19, 'Dirección General de Relaciones Laborales', 'la', 'Subsec. de Recursos Humanos. Sec. Gobierno, Modernización y Transparencia', 'la', 'relacioneslaborales@comodoro.gov.ar', NULL, NULL, '2974248749', 'Lucia Luengo (DG)', NULL, NULL, '2025-12-06 02:39:29', '2026-01-11 15:35:15'),
(20, 'Dirección General de Servicios Administrativos', 'la', 'Subsec. de Gestión Presupuestaria. Sec. de Economía, Finanzas y Control de Gestión', 'la', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 02:39:29'),
(21, 'Dirección General de Tránsito', 'la', 'Subsec. de Seguridad. Sec. de Control Urbano y Operativo', 'la', 'transito@comodoro.gov.ar', 'administraciontransito@comodoro.gov.ar', NULL, NULL, NULL, NULL, 'transitomcr@gmail.com', '2025-12-06 02:39:29', '2025-12-11 20:29:18'),
(22, 'Dirección General de Transporte', 'la', 'Subsec. de Transporte. Sec. de Gobierno, Modernización y Transparencia', 'la', 'transporte@comodoro.gov.ar', NULL, NULL, NULL, 'Fabian Minervino', '2976236867', NULL, '2025-12-06 02:39:29', '2025-12-11 20:29:59'),
(23, 'Dirección General de Veterinaria, Control de Fauna Urbana y Plagas', 'la', 'Subsec. de Fiscalización. Sec. de Control Urbano y Operativo', 'la', 'veterinaria@comodoro.gov.ar', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 02:39:29'),
(24, 'Empresa Argentina de Navegación Aérea', 'la', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:48:58'),
(25, 'Ente Autárquico Comodoro Deportes', 'el', 'Intendencia', 'la', NULL, NULL, '297 446-4920', NULL, 'Martín Gurisich (DG Deportes Zona Centro)', '297 4363576', NULL, '2025-12-06 02:39:29', '2026-01-13 12:48:53'),
(26, 'Ente Autárquico Comodoro Turismo', 'el', 'Intendencia', 'la', 'estadisticas@comodoroturismo.gob.ar', 'direccionturismo@comodoro.gov.ar', '297 4440664', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:48:47'),
(27, 'Honorable Concejo Deliberante de Comodoro Rivadavia', 'el', NULL, NULL, 'mesadeentrada@concejocomodoro.gob.ar', NULL, '297 447-8623', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:48:42'),
(28, 'Instituto Geográfico Nacional de la República Argentina', 'el', NULL, NULL, 'eflascano@ign.gob.ar', NULL, '11 7078-0381', '1170588204', ' Emiliano Fernández Lascano', NULL, 'eflascano@ign.gob.ar', '2025-12-06 02:39:29', '2026-01-13 12:48:37'),
(29, 'Instituto Nacional de Estadística y Censos de la República Argentina', 'el', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:48:33'),
(30, 'Ministerio de Educación del Chubut', 'el', 'Gobierno de la Provincia del Chubut', 'el', 'ministerioeducacion@chubut.gov.ar', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:48:27'),
(31, 'Municipalidad de Comodoro Rivadavia', 'la', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:45:50'),
(32, 'Secretaría de Cultura', 'la', 'Intendencia', 'la', 'cultura@comodoro.gov.ar', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 23:49:37'),
(33, 'Secretaría de Desarrollo Humano y Familia', 'la', 'Intendencia', 'la', 'desarrollohumano@comodoro.gov.ar', 'desarrollohumanomcr@gmail.com', NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-11 20:31:50'),
(34, 'Secretaría de Economía, Finanzas y Control de Gestión', 'la', 'Intendencia', 'la', NULL, NULL, NULL, '2974629780', 'Cecilia Schlebusch (Despacho)', '2974923146', NULL, '2025-12-06 02:39:29', '2025-12-11 20:35:28'),
(35, 'Secretaría de Energía de Nación', 'la', 'Intendencia', 'la', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 02:39:29'),
(36, 'Secretaría de Infraestructura, Obras y Servicios Públicos', 'la', 'Intendencia', 'la', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 02:39:29'),
(37, 'Secretaría de la Mujer, Género y Diversidad', 'la', 'Intendencia', 'la', NULL, NULL, NULL, '2974116273', NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-07 00:05:02'),
(38, 'Dirección de Información Tributaria. Dirección General de Análisis y Administración Tributaria', 'la', 'Secretaría de Recaudación', 'la', 'dirautomotor@comodoro.gov.ar', NULL, NULL, NULL, 'Anabel López', NULL, NULL, '2025-12-06 02:39:29', '2025-12-11 16:19:03'),
(39, 'Secretaría de Salud', 'la', 'Intendencia', 'la', 'salud@comodoro.gov.ar', NULL, '297 446-1153', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 23:53:01'),
(40, 'Subsecretaría de Comunicación', 'la', 'Secretaría General de Comunicación y de Relaciones Institucionale', 'la', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 17:18:05'),
(41, 'Sociedad Cooperativa Popular Limitada', 'la', NULL, NULL, 'contacto@scplcr.com', NULL, '297 406-2020', NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:48:10'),
(42, 'Subsecretaria de Coordinación Económica y Control de Gestión', 'la', 'Sec. de Economía, Finanzas y Control de Gestión', 'la', 'coordinacioneconomica.mcr@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2025-12-06 16:26:36'),
(43, 'Tribunal Electoral del Chubut', 'el', NULL, NULL, 'info@electoralchubut.gob.ar', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:48:01'),
(44, 'Dirección Nacional de Vialidad', 'la', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 02:39:29', '2026-01-13 12:48:05'),
(45, 'Dirección General de Prensa y Comunicación Institucional', 'la', 'Subsecretaría de Comunicación. Secretaría General, de Comunicación y de Relaciones Institucionales', 'la', 'prensa@comodoro.gov.ar', NULL, NULL, '2974616443', 'Adriana Luengo (Administración)', '2974606599', NULL, '2025-12-06 17:13:51', '2025-12-11 20:40:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cambios_pendientes`
--

CREATE TABLE `cambios_pendientes` (
  `id` int(11) NOT NULL,
  `tipo_cambio` enum('crear','editar','eliminar') NOT NULL,
  `dataset_id` int(11) DEFAULT NULL,
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`datos_nuevos`)),
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `usuario_id` int(11) NOT NULL,
  `estado` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `revisor_id` int(11) DEFAULT NULL,
  `comentario_rechazo` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `revisado_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cambios_pendientes`
--

INSERT INTO `cambios_pendientes` (`id`, `tipo_cambio`, `dataset_id`, `datos_nuevos`, `datos_anteriores`, `usuario_id`, `estado`, `revisor_id`, `comentario_rechazo`, `created_at`, `revisado_at`) VALUES
(1, 'crear', NULL, '{\"titulo\":\"Población y Viviendas por Barrio Censo 2022\",\"descripcion\":\"Datos oficiales del Censo Nacional de Población, Hogares y Viviendas 2022 procesados por la Dirección de Investigación Territorial, con información desagregada por barrios de Comodoro Rivadavia. Incluye cantidad de población y viviendas censadas en cada barrio según relevamiento oficial INDEC. Esta información constituye la fuente de datos demográficos más actualizada para planificación urbana, diseño de políticas públicas focalizadas territorialmente y estudios socioeconómicos barriales.\",\"area_id\":29,\"frecuencia_id\":10,\"ultima_actualizacion\":\"2026-01-23\",\"proxima_actualizacion\":\"2031-12-31\",\"tema_principal_id\":8,\"tema_secundario_id\":null,\"url_dataset\":\"https://datos.comodoro.gov.ar/dataset/poblacion-y-viviendas-por-barrio-censo-2022\",\"observaciones\":null,\"tipo_gestion\":\"externa\",\"formatos\":[2,1]}', NULL, 1, 'aprobado', 2, NULL, '2026-01-26 14:35:44', '2026-01-26 14:36:56'),
(2, 'crear', NULL, '{\"titulo\":\"Población por Radio Censal Censo 2022\",\"descripcion\":\"Cartografía oficial de radios censales de Comodoro Rivadavia con datos poblacionales del Censo Nacional 2022, procesada por la Dirección de Investigación Territorial. Los radios censales constituyen las unidades operativas oficiales de INDEC que subdividen exhaustivamente el territorio municipal. Esta información georreferenciada es fundamental para análisis demográfico, planificación territorial, diseño de políticas públicas focalizadas y estudios socioeconómicos según estándares nacionales.\",\"area_id\":29,\"frecuencia_id\":10,\"ultima_actualizacion\":\"2026-01-26\",\"proxima_actualizacion\":\"2031-12-31\",\"tema_principal_id\":8,\"tema_secundario_id\":null,\"url_dataset\":\"https://datos.comodoro.gov.ar/dataset/poblacion-por-radio-censal-censo-2022\",\"observaciones\":null,\"tipo_gestion\":\"externa\",\"formatos\":[6]}', NULL, 2, 'aprobado', 1, NULL, '2026-01-26 14:38:17', '2026-01-26 14:38:51'),
(3, 'editar', 36, '{\"ultima_actualizacion\":\"2026-01-30\",\"proxima_actualizacion\":\"2027-01-30\",\"notas\":null}', '{\"ultima_actualizacion\":\"2025-09-29T03:00:00.000Z\",\"proxima_actualizacion\":\"2026-01-31T03:00:00.000Z\"}', 2, 'aprobado', 1, NULL, '2026-01-30 15:12:00', '2026-01-30 15:12:59'),
(4, 'editar', 35, '{\"ultima_actualizacion\":\"2026-01-30\",\"proxima_actualizacion\":\"2027-01-30\",\"notas\":null}', '{\"ultima_actualizacion\":\"2025-12-01T03:00:00.000Z\",\"proxima_actualizacion\":\"2026-01-31T03:00:00.000Z\"}', 2, 'aprobado', 1, NULL, '2026-01-30 15:12:11', '2026-01-30 15:12:53'),
(5, 'editar', 52, '{\"ultima_actualizacion\":\"2026-02-04\",\"proxima_actualizacion\":\"2026-08-03\",\"notas\":null}', '{\"ultima_actualizacion\":\"2025-12-17T03:00:00.000Z\",\"proxima_actualizacion\":\"2026-01-31T03:00:00.000Z\"}', 2, 'rechazado', 1, 'Prox fecha 31/7/2026', '2026-02-04 11:56:40', '2026-02-04 12:53:29'),
(6, 'editar', 52, '{\"ultima_actualizacion\":\"2026-02-04\",\"proxima_actualizacion\":\"2026-08-03\",\"notas\":null}', '{\"ultima_actualizacion\":\"2025-12-17T03:00:00.000Z\",\"proxima_actualizacion\":\"2026-01-31T03:00:00.000Z\"}', 1, 'rechazado', 2, 'Mal la fecha', '2026-02-04 12:53:55', '2026-02-04 12:57:02'),
(7, 'editar', 52, '{\"titulo\":\"Directores Generales de Planta Permanente\",\"descripcion\":\"Nómina oficial de Directores Generales de planta permanente del Poder Ejecutivo Municipal de Comodoro Rivadavia al 30 de junio, discriminados entre titulares y subrogantes. Información confeccionada a partir de resoluciones de designación publicadas en Boletín Oficial. Facilita que la ciudadanía identifique a los responsables de cada área municipal para consultas, trámites y gestiones, promoviendo el acceso directo a las autoridades de carrera administrativa.\",\"area_id\":19,\"frecuencia_id\":5,\"ultima_actualizacion\":\"2026-02-04\",\"proxima_actualizacion\":\"2026-07-31\",\"tema_principal_id\":4,\"tema_secundario_id\":null,\"url_dataset\":\"https://datos.comodoro.gov.ar/dataset/directores-generales-de-planta-permanente\",\"observaciones\":null,\"tipo_gestion\":\"externa\",\"formatos\":[1,2]}', '{\"titulo\":\"Directores Generales de Planta Permanente\",\"descripcion\":\"Nómina oficial de Directores Generales de planta permanente del Poder Ejecutivo Municipal de Comodoro Rivadavia al 30 de junio, discriminados entre titulares y subrogantes. Información confeccionada a partir de resoluciones de designación publicadas en Boletín Oficial. Facilita que la ciudadanía identifique a los responsables de cada área municipal para consultas, trámites y gestiones, promoviendo el acceso directo a las autoridades de carrera administrativa.\",\"area_id\":19,\"frecuencia_id\":5,\"ultima_actualizacion\":\"2025-12-17T03:00:00.000Z\",\"proxima_actualizacion\":\"2026-01-31T03:00:00.000Z\",\"tema_principal_id\":4,\"tema_secundario_id\":null,\"url_dataset\":\"https://datos.comodoro.gov.ar/dataset/directores-generales-de-planta-permanente\",\"observaciones\":null,\"tipo_gestion\":\"externa\",\"formatos\":[1,2]}', 2, 'aprobado', 1, NULL, '2026-02-04 12:57:46', '2026-02-04 12:58:15'),
(8, 'editar', 3, '{\"ultima_actualizacion\":\"2026-02-04\",\"proxima_actualizacion\":\"2026-08-03\",\"notas\":null}', '{\"ultima_actualizacion\":\"2025-07-31T03:00:00.000Z\",\"proxima_actualizacion\":\"2026-01-31T03:00:00.000Z\"}', 1, 'rechazado', 2, 'Rechazado', '2026-02-04 14:05:48', '2026-02-04 15:28:41'),
(9, 'editar', 71, '{\"ultima_actualizacion\":\"2026-02-04\",\"proxima_actualizacion\":\"2027-01-31\",\"notas\":null}', '{\"ultima_actualizacion\":\"2025-09-27T03:00:00.000Z\",\"proxima_actualizacion\":\"2026-01-31T03:00:00.000Z\"}', 1, 'rechazado', 2, 'Rechazado', '2026-02-04 15:25:56', '2026-02-04 15:28:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `datasets`
--

CREATE TABLE `datasets` (
  `id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `area_id` int(11) NOT NULL,
  `frecuencia_id` int(11) NOT NULL,
  `ultima_actualizacion` date DEFAULT NULL,
  `proxima_actualizacion` date DEFAULT NULL,
  `tema_principal_id` int(11) NOT NULL,
  `tema_secundario_id` int(11) DEFAULT NULL,
  `url_dataset` varchar(500) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `tipo_gestion` enum('interna','externa') NOT NULL DEFAULT 'externa',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `datasets`
--

INSERT INTO `datasets` (`id`, `titulo`, `descripcion`, `area_id`, `frecuencia_id`, `ultima_actualizacion`, `proxima_actualizacion`, `tema_principal_id`, `tema_secundario_id`, `url_dataset`, `observaciones`, `tipo_gestion`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Presupuesto Municipal', 'Presupuesto de gastos de la Municipalidad de Comodoro Rivadavia discriminado por jurisdicción y tipo de gasto. Cumple con las obligaciones de transparencia activa establecidas en el Artículo 6° de la Ordenanza N° 17.662/23 sobre Gobierno Abierto para garantizar el acceso ciudadano a información presupuestaria, facilitar el control sobre el destino de los fondos públicos y fortalecer la rendición de cuentas de la gestión municipal.', 34, 6, '2025-01-31', '2026-01-31', 1, NULL, 'https://datos.comodoro.gov.ar/dataset/presupuesto-municipal', NULL, 'externa', 1, '2025-11-30 21:00:52', '2026-01-12 14:38:53'),
(2, 'Gasto Público', 'Registro de ejecución del gasto público de la Municipalidad de Comodoro Rivadavia discriminado por jurisdicción y categoría de gasto que incluye personal, funcionamiento, transferencias, obras públicas, bienes de capital, deuda, higiene urbana y otros rubros. Cumple con obligaciones de transparencia activa según Ordenanza N° 17.662/23 para garantizar control ciudadano sobre destino efectivo de fondos públicos y rendición de cuentas municipal.', 34, 5, '2025-07-31', '2026-01-31', 1, NULL, 'https://datos.comodoro.gov.ar/dataset/gasto-publico', NULL, 'externa', 1, '2025-11-30 21:00:52', '2026-01-12 14:54:43'),
(3, 'Funcionarios Públicos', 'Nómina oficial de funcionarios de planta política del Poder Ejecutivo Municipal de Comodoro Rivadavia al 30 de junio de cada año, que incluye Intendente, Viceintendente, Secretarios, Subsecretarios y Coordinadores. Datos organizados por secretaría, sector y cargo para transparentar la estructura de conducción gubernamental, garantizar el derecho de acceso a la información pública conforme a la Ordenanza N° 17.662/23 y facilitar el control ciudadano.', 18, 5, '2025-07-31', '2026-01-31', 4, NULL, 'https://datos.comodoro.gov.ar/dataset/funcionarios-publicos', NULL, 'externa', 1, '2025-11-30 21:00:52', '2026-01-12 14:52:29'),
(4, 'Castraciones de Animales', 'Serie estadística mensual de castraciones quirúrgicas realizadas por la Dirección General de Veterinaria de la Municipalidad de Comodoro Rivadavia. El dataset registra intervenciones discriminadas por especie (caninos y felinos) y sexo (macho y hembra). La información permite analizar la demanda del servicio, evaluar cobertura territorial, identificar patrones estacionales y realizar planificación de recursos sanitarios. Los datos constituyen un insumo para políticas de salud pública preventiva.', 23, 6, '2025-02-13', '2026-01-31', 8, NULL, 'https://datos.comodoro.gov.ar/dataset/castraciones-de-animales', NULL, 'externa', 1, '2025-11-30 21:00:52', '2025-12-06 02:39:29'),
(5, 'Obra Pública', 'Registro de obras públicas ejecutadas en Comodoro Rivadavia, con información sobre procesos de contratación, empresas adjudicatarias y montos involucrados. Incluye datos de licitaciones públicas, concursos privados de precios y contrataciones directas, entre otros tipos de contratación, con detalle de presupuesto oficial y monto del contrato.', 36, 5, '2025-07-31', '2026-01-31', 4, 5, 'https://datos.comodoro.gov.ar/dataset/obra-publica', NULL, 'externa', 1, '2025-11-30 21:00:52', '2026-01-12 14:54:36'),
(6, 'Manejo de residuos sólidos urbanos en Comodoro Rivadavia', 'Registro mensual del manejo de residuos sólidos urbanos en Comodoro Rivadavia expresado en toneladas. Incluye residuos ingresados, domiciliarios, de grandes generadores, procesados y recuperados en la Planta de Tratamiento de Residuos Sólidos y Urbanos (PTRSU). Discrimina materiales húmedos, secos y vidrio para análisis de gestión ambiental, planificación de servicios públicos y evaluación de programas de reciclaje.', 13, 6, '2025-09-26', '2026-01-31', 7, NULL, 'https://datos.comodoro.gov.ar/dataset/manejo-de-residuos-solidos-urbanos-en-comodoro-rivadavia', NULL, 'externa', 1, '2025-12-01 11:30:36', '2025-12-06 02:39:29'),
(7, 'Infracciones de Tránsito', 'Serie estadística mensual de actas labradas por infracciones de tránsito en Comodoro Rivadavia. El dataset registra la cantidad de infracciones según tipo de falta: alcoholemia positiva, exceso de velocidad, cruce de semáforo en rojo, maniobras peligrosas, falta de revisión técnica obligatoria, entre otras. La información permite analizar la evolución temporal de las infracciones, identificar patrones de comportamiento vial y evaluar el impacto de políticas de seguridad vial.', 21, 6, '2025-10-30', '2026-01-31', 6, 4, 'https://datos.comodoro.gov.ar/dataset/infracciones-de-transito', NULL, 'externa', 1, '2025-12-01 12:05:47', '2025-12-06 02:39:29'),
(8, 'Ejecución presupuestaria', 'Registro de ejecución presupuestaria de la Municipalidad de Comodoro Rivadavia discriminado en ingresos y egresos efectivamente percibidos y ejecutados. Cumple con obligaciones de transparencia activa de la normativa vigente para garantizar acceso ciudadano a información sobre recursos efectivamente recaudados y gastos realizados, facilitar control sobre gestión fiscal y fortalecer rendición de cuentas municipal.', 42, 5, '2025-06-30', '2025-07-31', 1, 4, 'https://datos.comodoro.gov.ar/dataset/ejecucion-presupuestaria-2024', NULL, 'externa', 1, '2025-12-01 12:07:27', '2025-12-06 02:39:29'),
(9, 'Pedidos de Acceso a la Información Pública', 'Registro de solicitudes de acceso a la información pública presentadas ante la Agencia de AIP de la Municipalidad de Comodoro Rivadavia, en cumplimiento de la Ordenanza N° 4388/93 y normativa provincial vigente. Incluye datos sobre pedidos realizados por la ciudadanía ejerciendo su derecho constitucional de acceso a información en poder del Estado Municipal. Los datos permiten transparentar las solicitudes recibidas y promover el control ciudadano sobre la gestión pública', 1, 5, '2025-07-31', '2025-01-31', 4, NULL, 'https://datos.comodoro.gov.ar/dataset/pedidos-de-acceso-a-la-informacion-publica', NULL, 'externa', 1, '2025-12-01 12:56:13', '2026-01-12 15:08:53'),
(10, 'Pauta Publicitaria', 'Registro oficial de contratos de pauta publicitaria municipal correspondientes a cada año según información difundida en el Boletín Oficial. Incluye montos contratados, características de publicaciones, tipo de medio y empresas adjudicatarias para transparentar el gasto público en comunicación oficial, facilitar el control ciudadano sobre inversión publicitaria municipal y garantizar rendición de cuentas conforme a principios de gobierno abierto establecidos en Ordenanza N° 17.662/23.', 40, 5, '2025-07-31', '2026-01-31', 4, NULL, 'https://datos.comodoro.gov.ar/dataset/pauta-publicitaria', NULL, 'externa', 1, '2025-12-01 12:57:48', '2026-01-12 14:54:32'),
(11, 'Parque Automotor (Patentamiento)', 'Serie histórica de vehículos habilitados en Comodoro Rivadavia discriminados por tipo: automóviles, pick ups, motos, camiones, ómnibus, acoplados y otros rodados. Refleja la composición de la flota vehicular local para análisis de movilidad urbana, planificación de infraestructura vial, estudios de tránsito, políticas de transporte y estimación de demanda de servicios relacionados con el parque automotor municipal.', 38, 6, '2022-12-31', '2024-01-31', 1, 4, 'https://datos.comodoro.gov.ar/dataset/parque-automotor', NULL, 'externa', 1, '2025-12-01 13:01:35', '2025-12-06 02:39:29'),
(12, 'Seguridad Pública', 'Registro oficial de instituciones de seguridad pública y justicia en Comodoro Rivadavia. Incluye fuerzas armadas, policía provincial, destacamentos de bomberos voluntarios, fuerzas de seguridad nacional (Gendarmería, Prefectura Naval, Policía Federal), servicios de aduana y migraciones, defensa civil y juzgados de paz. El dataset proporciona información detallada de ubicación geográfica y datos de contacto de cada institución. Relevamiento realizado por la Dirección de Investigación Territorial.', 14, 7, '2025-11-12', '2027-03-31', 6, NULL, 'https://datos.comodoro.gov.ar/dataset/seguridad-publica', NULL, 'interna', 1, '2025-12-01 13:43:31', '2025-12-06 02:39:29'),
(13, 'Siniestros viales por categoría', 'Serie histórica de siniestros de tránsito en Comodoro Rivadavia clasificados por gravedad: con víctimas fatales, con heridos leves y graves, y sin víctimas. Datos oficiales fundamentales para diseño de políticas públicas de seguridad vial, identificación de zonas críticas, evaluación de efectividad de medidas preventivas y planificación de infraestructura urbana segura. Permite análisis de tendencias para reducción de siniestralidad vial.', 2, 6, '2023-12-31', '2025-01-31', 6, 4, 'https://datos.comodoro.gov.ar/dataset/siniestros-viales-por-categoria', NULL, 'externa', 1, '2025-12-01 13:48:02', '2025-12-06 02:39:29'),
(14, 'Guía Práctica: Licencia CC BY-SA 4.0', 'Guía metodológica elaborada por la Dirección de Datos Públicos y Comunicación para la correcta comprensión y aplicación de la licencia Creative Commons Atribución-CompartirIgual 4.0 Internacional en el uso de datos abiertos municipales. Explica permisos, obligaciones, formas correctas de citación y casos prácticos. Desarrollada en cumplimiento del Artículo 9° de la Ordenanza N° 17.662/23, que establece esta licencia como obligatoria para todos los datos publicados en el portal municipal. ', 5, 11, '2025-10-30', NULL, 4, NULL, 'https://datos.comodoro.gov.ar/dataset/guia-practica-licencia-cc-by-sa-4-0', NULL, 'interna', 1, '2025-12-01 14:15:12', '2025-12-06 02:39:29'),
(15, 'Guía Práctica Estructuración de Datos Abiertos 2025', 'Guía metodológica elaborada por la Dirección de Datos Públicos y Comunicación para normalización y estructuración de datos públicos municipales. Basada en estándares nacionales, establece principios técnicos, nomenclatura de campos, formatos de celdas y ejemplos prácticos aplicados a la gestión municipal. Instrumento de capacitación para todas las áreas que generen o publiquen datos, garantizando interoperabilidad, reutilización y cumplimiento de la Ordenanza N° 17.662/23.', 5, 11, '2025-10-28', NULL, 4, NULL, 'https://datos.comodoro.gov.ar/dataset/guia-practica-estructuracion-de-datos-abiertos-2025', NULL, 'interna', 1, '2025-12-01 14:16:24', '2025-12-06 02:39:29'),
(16, 'Guía Práctica de Apertura de Datos', 'Guía metodológica elaborada por la Dirección de Datos Públicos y Comunicación para la implementación de políticas de apertura de datos en el ámbito municipal. Desarrolla conceptos fundamentales sobre datos abiertos y públicos, proceso de identificación y priorización de datos, licencias, formatos y publicación. Basada en estándares nacionales y en el marco de la Ordenanza N° 17.662/23. Instrumento de capacitación para áreas municipales que generan o publican datos, garantizando calidad.', 5, 11, '2025-10-28', NULL, 4, NULL, 'https://datos.comodoro.gov.ar/dataset/guia-practica-de-apertura-de-datos', NULL, 'interna', 1, '2025-12-01 14:19:54', '2025-12-06 02:39:29'),
(17, 'Paradas de transporte público', 'Registro oficial de paradas de transporte público urbano en Comodoro Rivadavia. Incluye información detallada sobre estado operativo, infraestructura disponible (refugios, postes indicadores, carteles de prohibido estacionar), ubicación exacta y coordenadas geográficas de cada parada. Esta información facilita la planificación del transporte público, estudios de accesibilidad urbana y proporciona datos esenciales para la gestión del sistema.', 22, 7, '2023-09-30', '2025-09-30', 11, NULL, 'https://datos.comodoro.gov.ar/dataset/paradas-de-transporte-publico', NULL, 'interna', 1, '2025-12-01 14:22:26', '2025-12-06 02:39:29'),
(18, 'Sucursales Bancarias y Financieras de Comodoro Rivadavia', 'Registro oficial de sucursales bancarias en Comodoro Rivadavia elaborado por la Dirección de Investigación Territorial con información del Banco Central de la República Argentina (BCRA). Incluye datos de contacto, ubicación geográfica y disponibilidad de cajeros automáticos para facilitar el acceso ciudadano a servicios financieros y planificación de infraestructura bancaria urbana.', 4, 7, '2025-10-22', '2027-03-31', 1, 5, 'https://datos.comodoro.gov.ar/dataset/sucursales-bancarias-de-comodoro-rivadavia', NULL, 'interna', 1, '2025-12-01 14:27:20', '2025-12-06 02:39:29'),
(19, 'Comedores Comunitarios', 'Registro oficial de comedores comunitarios en funcionamiento en la ciudad de Comodoro Rivadavia. Estos espacios brindan asistencia alimentaria y contención social a sectores vulnerables de la población, constituyendo una red fundamental de desarrollo comunitario y seguridad alimentaria. El dataset proporciona información detallada de cada establecimiento: ubicación geográfica precisa, datos de contacto y denominación. Relevamiento realizado por la Dirección de Investigación Territorial.', 33, 7, '2025-10-23', '2027-03-31', 5, 8, 'https://datos.comodoro.gov.ar/dataset/comedores-comunitarios', NULL, 'interna', 1, '2025-12-01 14:28:49', '2025-12-06 02:39:29'),
(20, 'Jardines Maternales Comunitarios', 'Registro oficial de jardines maternales comunitarios en funcionamiento en la ciudad de Comodoro Rivadavia. Estos establecimientos brindan atención y educación a niños y niñas en la primera infancia, constituyendo una red fundamental de contención social y desarrollo educativo temprano. El dataset proporciona información detallada de cada establecimiento: ubicación geográfica precisa, datos de contacto y denominación. Relevamiento realizado por la Dirección de Investigación Territorial.', 6, 7, '2025-10-23', '2027-03-31', 2, 4, 'https://datos.comodoro.gov.ar/dataset/jardines-maternales-comunitarios', NULL, 'interna', 1, '2025-12-01 14:29:49', '2025-12-07 00:07:52'),
(21, 'Infraestructura de Salud Privada', 'Registro oficial de establecimientos de salud privados y servicios sanitarios complementarios en Comodoro Rivadavia. Incluye clínicas, empresas de emergencias médicas, laboratorios de análisis clínicos, farmacias, ópticas, geriátricos, clínicas veterinarias y comercios de artículos ortopédicos. El dataset proporciona información completa de cada establecimiento: ubicación geográfica, datos de contacto y categorización. Relevamiento realizado por la Dirección de Investigación Territorial.', 39, 7, '2025-10-21', '2027-03-31', 9, NULL, 'https://datos.comodoro.gov.ar/dataset/infraestructura-de-salud-privada', NULL, 'interna', 1, '2025-12-01 14:32:49', '2025-12-06 02:39:29'),
(22, 'Espacios Culturales', 'Registro oficial de espacios culturales habilitados en la ciudad. Incluye bibliotecas populares, centros culturales, espacios culturales independientes, salas de teatro, museos y librerías. El dataset proporciona información detallada de cada establecimiento: ubicación geográfica, datos de contacto y categorización por tipo de espacio. Relevamiento realizado por la Dirección de Investigación Territorial, constituyendo una herramienta para la planificación cultural y el acceso ciudadano.', 32, 7, '2025-10-22', '2027-03-31', 2, 5, 'https://datos.comodoro.gov.ar/dataset/espacios-culturales', NULL, 'externa', 1, '2025-12-01 14:33:57', '2025-12-06 02:39:29'),
(23, 'Ocupación hotelera y cantidad de turistas', 'Serie histórica de indicadores clave de la actividad turística en Comodoro Rivadavia. El dataset contiene información sobre la cantidad de turistas alojados en establecimientos habilitados y el porcentaje de ocupación de plazas disponibles. Los datos permiten analizar la evolución temporal de la demanda turística, identificar temporadas altas y bajas, y evaluar el desempeño del sector hotelero local.', 26, 6, '2025-10-22', '2026-01-31', 12, 1, 'https://datos.comodoro.gov.ar/dataset/ocupacion-hotelera-y-cantidad-de-turistas', NULL, 'externa', 1, '2025-12-01 14:35:06', '2025-12-06 02:39:29'),
(24, 'Distancias desde Comodoro Rivadavia', 'Tabla de referencia de distancias terrestres desde Comodoro Rivadavia hacia todas las capitales provinciales de Argentina expresadas en kilómetros. Información útil para planificación de viajes, análisis logístico, estudios de conectividad territorial y referencia geográfica para ciudadanos, empresas y organismos públicos que requieran datos de distancias oficiales.', 14, 11, '2025-09-27', NULL, 12, NULL, 'https://datos.comodoro.gov.ar/dataset/distancias-desde-comodoro-rivadavia', NULL, 'interna', 1, '2025-12-01 14:37:51', '2025-12-06 02:39:29'),
(25, 'Hotelería en Comodoro Rivadavia', 'Registro oficial de la oferta hotelera de Comodoro Rivadavia con información suministrada por Comodoro Turismo y procesada por la Dirección de Investigación Territorial. Incluye categorización por estrellas, datos de contacto, ubicación geográfica y servicios para facilitar el acceso ciudadano y turístico, así como la planificación del sector hotelero y desarrollo de políticas de turismo local', 26, 7, '2025-12-16', '2027-11-30', 12, NULL, 'https://datos.comodoro.gov.ar/dataset/hoteleria-en-comodoro-rivadavia', NULL, 'externa', 1, '2025-12-01 14:40:23', '2025-12-20 03:29:21'),
(26, 'Infraestructura deportiva al aire libre en Comodoro Rivadavia', 'Registro oficial de infraestructura deportiva destinada a deportes al aire libre en Comodoro Rivadavia elaborado por la Dirección de Investigación Territorial. Incluye instalaciones de atletismo, fútbol oficial, golf, hockey, rugby y tenis con información sobre tipo de superficie, instituciones responsables, ámbito (público o privado) y ubicación geográfica para planificación deportiva y acceso ciudadano.', 25, 7, '2023-03-31', '2025-03-31', 12, NULL, 'https://datos.comodoro.gov.ar/dataset/infraestructura-deportiva-al-aire-libre-en-comodoro-rivadavia', NULL, 'interna', 1, '2025-12-01 14:41:32', '2025-12-06 02:39:29'),
(27, 'Playones deportivos en espacios públicos de Comodoro Rivadavia', 'Registro oficial de playones deportivos ubicados en espacios públicos de Comodoro Rivadavia resultado del relevamiento conjunto entre la Dirección de Investigación Territorial, la Dirección General de Catastro y el Área de Obras y Mantenimiento del Ente Autárquico \"Comodoro Deportes\". Incluye información sobre tipo de superficie, ubicación por barrio y zona para acceso ciudadano y planificación deportiva comunitaria.', 25, 7, '2023-03-31', '2025-03-31', 12, NULL, 'https://datos.comodoro.gov.ar/dataset/playones-deportivos-en-espacios-publicos-de-comodoro-rivadavia', NULL, 'externa', 1, '2025-12-01 14:43:18', '2025-12-06 02:39:29'),
(28, 'Proyectos de Inteligencia Artificial en la administración pública municipal', 'Registro de proyectos de Inteligencia Artificial implementados en la administración pública de Comodoro Rivadavia. Incluye información detallada de nombre, descripción, área responsable, área temática, estado de implementación y cronograma de ejecución. Datos fundamentales para transparencia algorítmica, seguimiento de políticas de modernización tecnológica y cumplimiento del marco regulatorio de uso ético de IA establecido en la normativa municipal vigente.', 14, 11, '2025-09-26', NULL, 4, NULL, 'https://datos.comodoro.gov.ar/dataset/proyectos-de-inteligencia-artificial-en-la-administracion-publica-municipal', NULL, 'interna', 1, '2025-12-01 14:44:27', '2025-12-06 02:39:29'),
(29, 'Centros de jubilados', 'Registro oficial de centros de jubilados y pensionados, y centros de día para adultos mayores en Comodoro Rivadavia. Incluye instituciones con información de contacto, ubicación geográfica y dependencia organizacional para facilitar el acceso de adultos mayores a espacios de encuentro, actividades recreativas, servicios sociales y promoción del envejecimiento activo y saludable.', 33, 7, '2025-10-02', '2027-03-31', 5, 9, 'https://datos.comodoro.gov.ar/dataset/centros-de-jubilados', NULL, 'interna', 1, '2025-12-01 14:45:59', '2025-12-06 02:39:29'),
(30, 'Puntos Fijos de la Red de Nivelación Argentina', 'Registro de pilares altimétricos de la Red de Nivelación Argentina (RN-Ar) del Instituto Geográfico Nacional ubicados en el ejido de Comodoro Rivadavia y sus cercanías. Estos puntos materializan el Sistema de Referencia Vertical Nacional (SRVN16), cuyo origen vertical fue definido en 1924 en Mar del Plata, y constituyen bases altimétricas oficiales para obras de infraestructura, aprovechamiento de aguas y estudios geodésicos. Alturas ortométricas calculadas con el método de Mader (1954).', 28, 11, '2025-10-22', NULL, 3, NULL, 'https://datos.comodoro.gov.ar/dataset/puntos-fijos-de-la-red-de-nivelacion-argentina', NULL, 'externa', 1, '2025-12-01 14:47:21', '2025-12-06 02:39:29'),
(31, 'Espacios reservados para vehículos de personas con movilidad reducida', 'Relevamiento de espacios reservados para estacionamiento de vehículos de personas con movilidad reducida en Comodoro Rivadavia realizado por la Dirección de Investigación Territorial. Incluye información sobre ubicación, señalización y estado de infraestructura para garantizar derechos de accesibilidad, fiscalizar cumplimiento normativo y planificar políticas de inclusión y movilidad urbana accesible.', 16, 7, '2023-03-31', '2025-03-31', 11, 8, 'https://datos.comodoro.gov.ar/dataset/espacios-reservados-para-vehiculos-de-personas-con-movilidad-reducida', NULL, 'interna', 1, '2025-12-01 14:50:44', '2025-12-06 02:39:29'),
(32, 'Medios Periodísticos', 'Registro oficial de medios de comunicación periodísticos en Comodoro Rivadavia que incluye radios, televisión, diarios y portales digitales. Contiene información sobre tipo de medio, licencias, frecuencias, datos de contacto, sitios web y redes sociales para facilitar el acceso ciudadano a fuentes de información, promover la libertad de expresión, transparentar el ecosistema mediático local y apoyar la investigación sobre medios de comunicación y pluralidad informativa.', 45, 7, '2025-12-19', '2027-11-30', 8, 5, 'https://datos.comodoro.gov.ar/dataset/medios-periodisticos', NULL, 'externa', 1, '2025-12-01 14:53:07', '2025-12-20 03:29:40'),
(33, 'Listado de Proveedores', 'Registro oficial de proveedores de la Municipalidad de Comodoro Rivadavia que incluye CUIT, razón social, nombre comercial y localidad. Transparenta las relaciones comerciales del municipio para garantizar el derecho de acceso a la información pública sobre contrataciones según Ordenanza N° 17.662/23, facilitar el control ciudadano sobre compras públicas, promover la competencia en licitaciones y apoyar la rendición de cuentas de la gestión municipal.', 20, 6, '2025-09-29', '2026-07-31', 4, NULL, 'https://datos.comodoro.gov.ar/dataset/listado-de-proveedores', NULL, 'externa', 1, '2025-12-01 14:54:54', '2025-12-06 02:39:29'),
(34, 'Superficie de Espacio Verde por habitantes', 'Indicador de superficie de espacios verdes expresado en hectáreas cada mil habitantes, desagregado por barrio de Comodoro Rivadavia. El cálculo se realiza a partir del relevamiento municipal de espacios verdes y la estimación de población y vivienda 2021, ambos disponibles en este portal. Permite evaluar la distribución y accesibilidad de áreas verdes en relación con la densidad poblacional de cada barrio.', 14, 7, '2023-03-31', '2025-03-31', 7, 8, 'https://datos.comodoro.gov.ar/dataset/superficie-de-espacio-verde-por-habitantes', NULL, 'interna', 1, '2025-12-01 14:56:00', '2025-12-06 02:39:29'),
(35, 'Movimientos aéreos del Aeropuerto Internacional General Mosconi', 'Serie histórica de movimientos aéreos (despegues y aterrizajes) en el Aeropuerto Internacional General Mosconi de Comodoro Rivadavia. Datos oficiales que permiten analizar la evolución de operaciones aeroportuarias, intensidad del tráfico aéreo, capacidad operativa y desarrollo de la infraestructura aeronáutica local. Fundamental para planificación aeroportuaria, análisis de conectividad y políticas de transporte aéreo.', 24, 6, '2026-01-30', '2027-01-30', 11, 1, 'https://datos.comodoro.gov.ar/dataset/movimientos-aereos-del-aeropuerto-internacional-general-mosconi', 'Fuente: https://www.eana.com.ar/institucional', 'externa', 1, '2025-12-01 15:04:58', '2026-01-30 15:12:53'),
(36, 'Tráfico de pasajeros aéreos en Comodoro Rivadavia', 'Serie histórica de pasajeros embarcados y desembarcados en el Aeropuerto Internacional General Mosconi de Comodoro Rivadavia. Datos oficiales que permiten analizar la evolución del tráfico aéreo, conectividad regional, tendencias de movilidad poblacional y desarrollo del sector aeroportuario local. Fundamental para planificación de infraestructura aeroportuaria, análisis económico y políticas de transporte.', 24, 6, '2026-01-30', '2027-01-30', 11, 1, 'https://datos.comodoro.gov.ar/dataset/trafico-de-pasajeros-aereos-en-comodoro-rivadavia', 'Fuente: https://www.eana.com.ar/institucional', 'externa', 1, '2025-12-01 15:06:08', '2026-01-30 15:12:59'),
(37, 'Fuerzas Armadas y Fuerzas de Seguridad', 'Registro oficial de dependencias de Fuerzas Armadas y Fuerzas de Seguridad establecidas en Comodoro Rivadavia con jurisdicción provincial y nacional. Incluye información de contacto, ubicación geográfica y datos institucionales para facilitar el acceso ciudadano, coordinación interinstitucional y planificación de servicios de seguridad y defensa en el territorio local.', 14, 11, '2025-09-29', NULL, 6, 5, 'https://datos.comodoro.gov.ar/dataset/fuerzas-armadas-y-fuerzas-de-seguridad', NULL, 'interna', 1, '2025-12-01 15:14:58', '2025-12-06 02:39:29'),
(38, 'Escala salarial municipal (planta permanente)', 'Serie histórica de escalas salariales de empleados municipales de planta permanente de Comodoro Rivadavia con vigencias desde enero 2023. Incluye sueldo básico por categoría laboral y períodos de vigencia para transparentar la política salarial municipal, facilitar el control ciudadano del gasto público en personal y permitir análisis de evolución remunerativa del sector público municipal.', 27, 5, '2025-09-27', '2026-03-31', 4, NULL, 'https://datos.comodoro.gov.ar/dataset/escala-salarial-municipal-planta-permanente', NULL, 'interna', 1, '2025-12-01 15:16:22', '2025-12-06 02:39:29'),
(39, 'Centros de Promoción Barrial', 'Registro oficial de Centros de Promoción Barrial (CPB) de la Secretaría de Desarrollo Humano y Familia que desarrollan políticas sociales territoriales para afianzar identidad, participación ciudadana y construcción de ciudadanía. Espacios de articulación territorial para gestión de derechos de niñez, adolescencia y familia, trabajo intersectorial y resolución comunitaria de problemáticas sociales mediante enfoque de protección integral de derechos', 17, 7, '2025-12-03', '2027-03-31', 9, 8, 'https://datos.comodoro.gov.ar/dataset/centros-de-promocion-barrial', NULL, 'interna', 1, '2025-12-01 15:19:28', '2025-12-06 02:39:29'),
(40, 'Centrales de generación eléctrica', 'Registro oficial de centrales de generación eléctrica ubicadas en ejidos de Comodoro Rivadavia y Rada Tilly o cercanías. Incluye centrales eólicas, térmicas y de ciclo combinado con información sobre tecnología, potencia instalada, agentes operadores y conexión al sistema eléctrico. Datos oficiales de la Secretaría de Energía de Nación para planificación energética, análisis de matriz eléctrica local y desarrollo de políticas energéticas', 35, 7, '2025-09-27', '2027-03-31', 5, 1, 'https://datos.comodoro.gov.ar/dataset/centrales-de-generacion-electrica', 'Fuente: http://datos.energia.gob.ar/dataset/generacion-electrica-centrales-de-generacion-', 'interna', 1, '2025-12-01 15:20:48', '2025-12-06 02:39:29'),
(41, 'Proyecto de Ordenanza Marco para el uso ético de la IA', 'Proyecto de ordenanza que establece el marco regulatorio para el uso ético, transparente y responsable de sistemas de Inteligencia Artificial en la administración pública municipal. Define principios rectores, crea un Comité Asesor interdisciplinario, establece criterios de transparencia, supervisión humana, protección de datos personales, mecanismos de participación ciudadana y evaluación de impacto algorítmico.', 14, 11, '2025-09-26', NULL, 6, 4, 'https://datos.comodoro.gov.ar/dataset/proyecto-de-ordenanza-marco-para-el-uso-etico-de-la-ia', NULL, 'interna', 1, '2025-12-01 15:22:22', '2025-12-06 02:39:29'),
(42, 'Establecimientos Educativos de Comodoro Rivadavia', 'Padrón oficial de establecimientos educativos de Comodoro Rivadavia conforme al relevamiento del Ministerio de Educación del Chubut. Incluye instituciones de todos los niveles educativos (inicial, primario, secundario, terciario) con información de gestión, dependencia, datos de contacto y ubicación para facilitar el acceso ciudadano a la oferta educativa local y planificación del sistema educativo.', 6, 7, '2024-12-31', '2026-03-31', 2, 5, 'https://datos.comodoro.gov.ar/dataset/establecimientos-educativos-de-comodoro-rivadavia', NULL, 'externa', 1, '2025-12-01 15:23:40', '2025-12-06 02:42:11'),
(43, 'Espacios Verdes de Comodoro Rivadavia', 'Registro de espacios verdes en Comodoro Rivadavia resultado del relevamiento conjunto entre la Dirección de Investigación Territorial, la Dirección General de Catastro y el Laboratorio de Sistemas de Información Geográfica de la UNPSJB. Incluye clasificación por tamaño, superficie en metros cuadrados y ubicación geográfica para planificación urbana, gestión ambiental y políticas de espacios públicos.', 15, 7, '2023-03-31', '2025-03-31', 7, NULL, 'https://datos.comodoro.gov.ar/dataset/espacios-verdes-de-comodoro-rivadavia', NULL, 'interna', 1, '2025-12-01 15:24:52', '2025-12-06 02:39:29'),
(44, 'Resultados de Elecciones Generales', 'Serie histórica de resultados definitivos de elecciones municipales en Comodoro Rivadavia para los cargos de Intendente, Concejales y Tribunal de Cuentas. Contiene información detallada de listas, partidos políticos, cantidad de votos y porcentajes obtenidos en cada proceso electoral. Datos oficiales que reflejan la participación democrática y evolución del sistema político local.', 43, 9, '2025-09-26', '2027-12-31', 6, NULL, 'https://datos.comodoro.gov.ar/dataset/resultados-de-elecciones-generales', NULL, 'externa', 1, '2025-12-01 15:27:05', '2025-12-06 02:39:29'),
(45, 'Dependencias Municipales de Comodoro Rivadavia', 'Registro oficial de dependencias e inmuebles donde funcionan oficinas municipales, incluyendo tanto propiedades municipales como alquiladas. Contiene información detallada de ubicación, coordenadas geográficas y fechas de vencimiento de contratos de alquiler cuando corresponde. Esta información facilita la localización de dependencias por parte de la ciudadanía y permite el control de la gestión patrimonial del Estado municipal, contribuyendo a la transparencia en el uso de bienes públicos.', 31, 6, '2025-12-16', '2026-12-31', 4, 5, 'https://datos.comodoro.gov.ar/dataset/dependencias-municipales-de-comodoro-rivadavia', NULL, 'interna', 1, '2025-12-01 15:28:15', '2025-12-20 03:28:36'),
(46, 'Consumo de agua potable en Comodoro Rivadavia (mensual)', 'Detalle mensual del consumo de agua potable en Comodoro Rivadavia medido en metros cúbicos. Información oficial suministrada por la Sociedad Cooperativa Popular Limitada (SCPL) para análisis estacional de demanda hídrica, estudios de variabilidad de consumo y planificación de servicios públicos.', 41, 6, '2025-10-22', '2026-01-31', 10, NULL, 'https://datos.comodoro.gov.ar/dataset/consumo-de-agua-potable-en-comodoro-rivadavia-mensual', NULL, 'externa', 1, '2025-12-01 15:29:34', '2025-12-06 02:39:29'),
(47, 'Ordenanza de Gobierno Abierto', 'Ordenanza N° 17.662/23 que establece el marco normativo para la implementación de políticas de Gobierno Abierto en la Municipalidad de Comodoro Rivadavia. Regula los principios de transparencia, participación ciudadana, rendición de cuentas e innovación, creando el Portal de Gobierno Abierto y estableciendo obligaciones de publicación activa de información municipal.', 27, 11, '2025-09-25', NULL, 6, NULL, 'https://datos.comodoro.gov.ar/dataset/ordenanza-de-gobierno-abierto', NULL, 'interna', 1, '2025-12-01 15:30:23', '2025-12-06 02:39:29'),
(48, 'Consumo de agua potable en Comodoro Rivadavia (anual)', 'Serie histórica del consumo total anual de agua potable en Comodoro Rivadavia medido en metros cúbicos. Información oficial suministrada por la Sociedad Cooperativa Popular Limitada (SCPL) para análisis de demanda hídrica, planificación de servicios públicos y estudios de consumo urbano.', 41, 6, '2025-09-25', '2026-01-31', 10, 7, 'https://datos.comodoro.gov.ar/dataset/consumo-de-agua-potable-en-comodoro-rivadavia-anual', NULL, 'externa', 1, '2025-12-01 15:35:59', '2025-12-06 02:39:29'),
(49, 'Consulados y Viceconsulados', 'Registro oficial de consulados y viceconsulados que operan en la ciudad de Comodoro Rivadavia, incluyendo información de contacto completa, ubicación geográfica y tipo de representación diplomática. Contiene datos actualizados sobre sedes consulares y viceconsulares honorarias de distintos países, con direcciones exactas, datos de comunicación y coordenadas geográficas para facilitar la localización de estos servicios diplomáticos a la ciudadanía.', 14, 6, '2025-09-25', '2027-03-31', 12, NULL, 'https://datos.comodoro.gov.ar/dataset/consulados-y-viceconsulados', NULL, 'interna', 1, '2025-12-01 15:37:43', '2025-12-06 02:39:29'),
(50, 'Evolución demográfica de Comodoro Rivadavia', 'Serie histórica de la evolución demográfica de Comodoro Rivadavia basada en los Censos Nacionales de Población, Hogares y Viviendas realizados por INDEC entre 1947 y 2022. Esta información permite analizar el crecimiento poblacional de la ciudad a lo largo de más de siete décadas, constituyendo una herramienta fundamental para estudios demográficos, planificación urbana, investigación social y diseño de políticas públicas basadas en tendencias poblacionales históricas de largo plazo.', 29, 10, '2025-10-22', '2031-12-31', 8, NULL, 'https://datos.comodoro.gov.ar/dataset/evolucion-demografica-de-comodoro-rivadavia', NULL, 'externa', 1, '2025-12-01 15:39:00', '2025-12-06 02:39:29'),
(51, 'Museos de Comodoro Rivadavia', 'Registro oficial de museos de Comodoro Rivadavia que incluye instituciones temáticas como el Museo Nacional del Petróleo, Museo Regional Patagónico, Museo Ferroportuario y Museo Histórico Militar, entre otros. Contiene información de contacto, ubicación geográfica y datos institucionales para facilitar el acceso ciudadano y turístico al patrimonio cultural y desarrollo de políticas culturales locales.', 32, 7, '2025-12-16', '2027-11-30', 2, 5, 'https://datos.comodoro.gov.ar/dataset/museos-de-comodoro-rivadavia', NULL, 'interna', 1, '2025-12-02 00:07:50', '2025-12-20 03:27:42'),
(52, 'Directores Generales de Planta Permanente', 'Nómina oficial de Directores Generales de planta permanente del Poder Ejecutivo Municipal de Comodoro Rivadavia al 30 de junio, discriminados entre titulares y subrogantes. Información confeccionada a partir de resoluciones de designación publicadas en Boletín Oficial. Facilita que la ciudadanía identifique a los responsables de cada área municipal para consultas, trámites y gestiones, promoviendo el acceso directo a las autoridades de carrera administrativa.', 19, 5, '2026-02-04', '2026-07-31', 4, NULL, 'https://datos.comodoro.gov.ar/dataset/directores-generales-de-planta-permanente', NULL, 'externa', 1, '2025-12-02 00:51:48', '2026-02-04 12:58:15'),
(53, 'Patrimonio Escultórico', 'Catálogo del patrimonio escultórico de Comodoro Rivadavia, que incluye bustos, esculturas, obras de arte, monolitos y cenotafios emplazados en el ejido municipal. El relevamiento inicial fue realizado en 2011 por la Dirección de Patrimonio Cultural y Natural y la Dirección General de Gestión Interinstitucional y Patrimonial, y se actualiza permanentemente. El registro se realiza en cumplimiento de la Ordenanza N° 11.866/15 que regula la colocación de monumentos en espacios públicos', 7, 11, '2025-09-29', NULL, 2, NULL, 'https://datos.comodoro.gov.ar/dataset/patrimonio-escultorico', NULL, 'externa', 1, '2025-12-02 12:23:49', '2025-12-06 02:42:52'),
(54, 'Gimnasios Municipales', 'Registro oficial de gimnasios municipales en Comodoro Rivadavia que incluye información sobre ubicación geográfica, barrio, datos de contacto y fecha de inauguración. Facilita el acceso ciudadano a infraestructura deportiva pública para práctica de actividad física, desarrollo de políticas de deporte social y planificación de equipamiento deportivo municipal para promoción de hábitos saludables y bienestar comunitario.', 25, 11, '2023-12-31', NULL, 12, 5, 'https://datos.comodoro.gov.ar/dataset/gimnasios-municipales', NULL, 'externa', 1, '2025-12-02 12:28:52', '2025-12-06 02:39:29'),
(55, 'Centros de Salud Públicos', 'Centros de salud dependientes del sector público en Comodoro Rivadavia. Incluye Centros de Atención Primaria de la Salud (CAPS) municipales y provinciales, así como hospitales públicos. Contiene información de contacto, ubicación geográfica, dirección postal y clasificación según dependencia administrativa. Recurso fundamental para el acceso ciudadano a servicios de salud pública y planificación sanitaria territorial', 39, 7, '2025-10-15', '2027-03-31', 9, NULL, 'https://datos.comodoro.gov.ar/dataset/centros-de-salud-publicos', NULL, 'interna', 1, '2025-12-02 12:30:04', '2025-12-06 02:39:29'),
(56, 'Guía Telefónica de áreas específicas de género', 'Directorio de contacto de áreas e instituciones especializadas en políticas de género y diversidad en Comodoro Rivadavia. Incluye teléfonos de contacto y descripción de acciones y servicios prestados para facilitar el acceso ciudadano a recursos de asistencia, asesoramiento y atención en situaciones de violencia de género, discriminación y promoción de derechos. Información esencial para orientación y derivación ciudadana.', 37, 6, '2025-12-12', '2027-05-31', 9, 4, 'https://datos.comodoro.gov.ar/dataset/guia-telefonica-de-areas-especificas-de-genero', NULL, 'externa', 1, '2025-12-02 12:31:25', '2025-12-12 11:28:58'),
(57, 'Presupuesto con perspectiva de género', 'Registro del presupuesto asignado a la Secretaría de la Mujer, Género y Diversidad discriminado por tipo de gasto: personal, funcionamiento y transferencias corrientes. Permite analizar la evolución de la inversión municipal en políticas de género, transparentar el gasto público destinado a programas de igualdad y facilitar el seguimiento de compromisos presupuestarios con perspectiva de género.', 37, 6, '2025-01-31', '2026-01-31', 9, 4, 'https://datos.comodoro.gov.ar/dataset/presupuesto-con-perspectiva-de-genero', NULL, 'externa', 1, '2025-12-02 12:33:26', '2026-01-12 15:12:26'),
(58, 'Áreas específicas de género', 'Registro oficial de áreas e instituciones especializadas en políticas de género y diversidad en Comodoro Rivadavia con jurisdicción municipal y provincial. Incluye información de ubicación geográfica, dependencia institucional y datos de contacto para facilitar el acceso ciudadano a espacios de asistencia, asesoramiento y atención en situaciones de violencia de género, discriminación y promoción de derechos de mujeres y diversidades.', 37, 6, '2025-12-16', '2026-11-30', 9, 4, 'https://datos.comodoro.gov.ar/dataset/areas-especificas-de-genero', NULL, 'externa', 1, '2025-12-02 12:35:43', '2026-01-07 00:27:03'),
(59, 'Entidades Religiosas', 'Registro de entidades religiosas en Comodoro Rivadavia elaborado a partir de datos de la Dirección de Investigación Territorial, la Dirección General de Cultos y el Registro Nacional de Cultos del Ministerio de Relaciones Exteriores. Incluye información sobre tipo de entidad, denominación religiosa, ubicación geográfica y datos de contacto para garantizar acceso ciudadano, análisis de diversidad religiosa y planificación territorial de espacios de culto.', 10, 7, '2025-10-14', '2027-03-31', 8, NULL, 'https://datos.comodoro.gov.ar/dataset/entidades-religiosas', NULL, 'externa', 1, '2025-12-02 12:36:52', '2025-12-06 02:39:29'),
(60, 'Sucursales Correo Argentino', 'Registro oficial de sucursales del Correo Oficial de la República Argentina (Correo Argentino) en Comodoro Rivadavia. Incluye información sobre ubicación geográfica, barrio de pertenencia, horarios de atención y referencias de esquinas para facilitar el acceso ciudadano a servicios postales estatales, planificación de logística postal y análisis de cobertura territorial de servicios de correspondencia y encomiendas en el ejido urbano.', 14, 7, '2024-12-31', '2026-03-31', 5, NULL, 'https://datos.comodoro.gov.ar/dataset/sucursales-correo-argentino', NULL, 'interna', 1, '2025-12-02 12:38:06', '2025-12-06 02:39:29'),
(61, 'Comercios habilitados por rubro', 'Registro oficial de comercios habilitados en Comodoro Rivadavia clasificados por rubro de actividad económica. Incluye nombre comercial, dirección y tipo de actividad para transparentar las habilitaciones municipales, facilitar el control ciudadano sobre la legalidad de establecimientos comerciales, apoyar la planificación económica urbana y el desarrollo de políticas de promoción comercial. Información fundamental para consumidores, emprendedores y organismos de control.', 12, 6, '2025-07-31', '2026-07-31', 1, NULL, 'https://datos.comodoro.gov.ar/dataset/comercios-habilitados-por-rubro', NULL, 'externa', 1, '2025-12-02 12:39:10', '2026-01-12 15:12:33'),
(62, 'Líneas de transporte público', 'Registro oficial de líneas de transporte público urbano de pasajeros (colectivos) en Comodoro Rivadavia. Incluye número de línea, denominación, empresa operadora y recorridos con puntos de origen, intermedios y destino final para facilitar el acceso ciudadano a información sobre transporte público, planificación de viajes, análisis de conectividad urbana y desarrollo de políticas de movilidad sustentable. Fundamental para usuarios del sistema de transporte colectivo.', 22, 7, '2021-12-31', '2025-09-30', 11, NULL, 'https://datos.comodoro.gov.ar/dataset/lineas-de-transporte-publico', NULL, 'interna', 1, '2025-12-02 12:40:54', '2025-12-06 02:39:29'),
(63, 'Radios Censales Indec 2022', 'Delimitación oficial de radios censales del Instituto Nacional de Estadística y Censos (INDEC) correspondientes al Censo Nacional 2022 en Comodoro Rivadavia. Unidades operativas que subdividen el territorio en forma exhaustiva clasificadas en urbano, rural o mixto. Fundamentales para análisis demográfico, planificación territorial, diseño de políticas públicas, estudios socioeconómicos y organización estadística municipal conforme a estándares nacionales de información censal.', 29, 10, '2025-10-08', '2031-12-31', 3, 8, 'https://datos.comodoro.gov.ar/dataset/radios-censales-indec-2022', NULL, 'externa', 1, '2025-12-02 12:42:10', '2025-12-06 02:39:29'),
(64, 'Límites administrativos (Departamento y Ejido)', 'Delimitación oficial de límites administrativos del departamento Escalante y ejidos municipales de Comodoro Rivadavia y Rada Tilly basada en información del Instituto Geográfico Nacional (IGN) y la Dirección General de Catastro. Proporciona los límites territoriales precisos para planificación territorial, administración pública y referencia geográfica oficial.', 28, 11, '2025-09-26', NULL, 3, 8, 'https://datos.comodoro.gov.ar/dataset/limites-administrativos-departamento-y-ejido', NULL, 'interna', 1, '2025-12-02 12:43:14', '2025-12-06 02:39:29'),
(65, 'Estaciones de Servicio', 'Registro oficial de estaciones de servicio en Comodoro Rivadavia que incluye empresas operadoras, ubicación geográfica, barrio, zona de la ciudad y datos de contacto. Facilita el acceso ciudadano a información sobre puntos de expendio de combustibles, planificación de viajes, análisis de cobertura territorial del servicio y desarrollo de políticas de abastecimiento energético y movilidad urbana.', 14, 7, '2025-10-03', '2027-03-31', 5, 1, 'https://datos.comodoro.gov.ar/dataset/estaciones-de-servicio', NULL, 'interna', 1, '2025-12-02 12:44:22', '2025-12-06 02:39:29'),
(66, 'Barrios de Comodoro Rivadavia', 'Delimitación oficial de barrios de Comodoro Rivadavia elaborada por la Dirección General de Modernización e Investigación Territorial con base en ordenanzas municipales vigentes y datos técnicos de la Dirección General de Catastro. Proporciona los límites geográficos precisos de cada barrio para planificación urbana, análisis territorial y servicios municipales georeferenciados.', 14, 11, '2025-09-25', NULL, 3, NULL, 'https://datos.comodoro.gov.ar/dataset/barrios-de-comodoro-rivadavia', NULL, 'interna', 1, '2025-12-02 12:47:16', '2025-12-07 17:11:02'),
(67, 'Cuarteles y destacamentos de Bomberos Voluntarios', 'Registro oficial de cuarteles y destacamentos de bomberos voluntarios en Comodoro Rivadavia. Incluye información de contacto, ubicación geográfica por barrio y datos institucionales para facilitar el acceso ciudadano a servicios de emergencia, coordinación de operativos de seguridad y planificación territorial de infraestructura de protección civil. Fundamental para gestión de riesgos y respuesta ante emergencias.', 3, 7, '2025-12-15', '2027-11-30', 5, 6, 'https://datos.comodoro.gov.ar/dataset/cuarteles-y-destacamentos-de-bomberos-voluntarios', NULL, 'interna', 1, '2025-12-02 12:48:44', '2025-12-20 03:28:06'),
(68, 'Sedes de Asociaciones Vecinales', 'Registro oficial de asociaciones vecinales que poseen sede social propia en Comodoro Rivadavia. Relevamiento realizado por la Dirección de Investigación Territorial en colaboración con la Dirección General de Asociaciones Vecinales y la Dirección General de Catastro. Facilita el acceso ciudadano a organizaciones comunitarias y apoya la planificación de políticas de participación vecinal y fortalecimiento institucional.', 8, 7, '2025-12-16', '2027-11-30', 8, 5, 'https://datos.comodoro.gov.ar/dataset/sedes-de-asociaciones-vecinales', NULL, 'interna', 1, '2025-12-02 12:49:48', '2025-12-20 03:26:25'),
(69, 'Cantidad de usuarios del servicio de saneamiento (serie histórica)', 'Serie histórica de usuarios del servicio de saneamiento (cloacas) en Comodoro Rivadavia. Información oficial suministrada por la Sociedad Cooperativa Popular Limitada (SCPL) que permite analizar la evolución temporal de la cobertura del servicio cloacal, crecimiento de la infraestructura sanitaria y planificación de políticas de saneamiento urbano para mejora de la calidad de vida ciudadana.', 41, 6, '2025-09-27', '2026-01-31', 10, NULL, 'https://datos.comodoro.gov.ar/dataset/cantidad-de-usuarios-del-servicio-de-saneamiento-serie-historica', NULL, 'externa', 1, '2025-12-02 13:04:53', '2025-12-06 02:39:29'),
(70, 'Cantidad de usuarios de energía eléctrica (serie histórica - por categoría)', 'Serie histórica de usuarios del servicio de energía eléctrica en Comodoro Rivadavia discriminados por categorías de consumo. Información oficial suministrada por la Sociedad Cooperativa Popular Limitada (SCPL) que permite analizar la composición y evolución temporal de diferentes tipos de usuarios, perfiles de consumo y planificación diferenciada de servicios energéticos.', 41, 6, '2025-09-27', '2026-01-31', 10, NULL, 'https://datos.comodoro.gov.ar/dataset/cantidad-de-usuarios-totales-de-energia-electrica-serie-historica-por-categoria', NULL, 'externa', 1, '2025-12-02 13:06:04', '2025-12-06 02:39:29'),
(71, 'Cantidad de usuarios de energía eléctrica (serie histórica - total)', 'Serie histórica de usuarios totales del servicio de energía eléctrica en Comodoro Rivadavia. Información oficial suministrada por la Sociedad Cooperativa Popular Limitada (SCPL) que permite analizar la evolución temporal de la cobertura del servicio eléctrico, crecimiento de la demanda y planificación de infraestructura energética.', 41, 6, '2025-09-27', '2026-01-31', 10, NULL, 'https://datos.comodoro.gov.ar/dataset/cantidad-de-usuarios-totales-de-energia-electrica-serie-historica-total', NULL, 'externa', 1, '2025-12-02 13:07:20', '2025-12-06 02:39:29'),
(72, 'Cantidad de usuarios del servicio de agua potable (serie histórica)', 'Serie histórica de usuarios del servicio de agua potable en Comodoro Rivadavia clasificados por categoría de medición: estimada (sin medidor) y medida (con medidor). Información oficial suministrada por la Sociedad Cooperativa Popular Limitada (SCPL) que permite analizar la evolución temporal de la cobertura del servicio, tendencias de medición y planificación de infraestructura hídrica a largo plazo.', 41, 6, '2025-09-26', '2026-01-31', 10, NULL, 'https://datos.comodoro.gov.ar/dataset/cantidad-de-usuarios-del-servicio-de-agua-potable-serie-historica', NULL, 'externa', 1, '2025-12-02 13:08:59', '2025-12-06 02:39:29'),
(73, 'Cantidad de usuarios del servicio de agua potable (anual)', 'Registro oficial de usuarios del servicio de agua potable en Comodoro Rivadavia clasificados por categoría: estimada (sin medidor) y medida (con medidor). Información suministrada por la Sociedad Cooperativa Popular Limitada (SCPL) para análisis de cobertura del servicio, planificación hídrica y gestión de servicios públicos esenciales.', 41, 6, '2025-09-26', '2026-01-31', 10, NULL, 'https://datos.comodoro.gov.ar/dataset/cantidad-de-usuarios-del-servicio-de-agua-potable-anual', NULL, 'externa', 1, '2025-12-02 13:09:58', '2025-12-06 02:39:29'),
(74, 'Tránsito Medio Diario Anual (TMDA) en Comodoro Rivadavia', 'Registro del Tránsito Medio Diario Anual (TMDA) en puntos estratégicos de Comodoro Rivadavia, definido como el volumen de tránsito total anual dividido por el número de días del año. Datos oficiales provistos por Vialidad Nacional que incluyen mediciones en Ruta Nacional 3 y su intersección con Ruta Nacional 26. Fundamental para planificación vial, análisis de flujo vehicular y desarrollo de políticas de transporte urbano.', 44, 6, '2025-09-26', '2026-03-31', 11, NULL, 'https://datos.comodoro.gov.ar/dataset/transito-medio-diario-anual-tmda-en-comodoro-rivadavia', NULL, 'externa', 1, '2025-12-02 13:10:46', '2025-12-06 02:39:29');
INSERT INTO `datasets` (`id`, `titulo`, `descripcion`, `area_id`, `frecuencia_id`, `ultima_actualizacion`, `proxima_actualizacion`, `tema_principal_id`, `tema_secundario_id`, `url_dataset`, `observaciones`, `tipo_gestion`, `activo`, `created_at`, `updated_at`) VALUES
(75, 'Puntos de Venta del Sistema de Estacionamiento Medido', 'Registro oficial de puntos de venta del Sistema de Estacionamiento Medido (SEM) en Comodoro Rivadavia. Comercios adheridos donde los ciudadanos que no poseen dispositivo móvil pueden solicitar \"Estacionamiento Puntual\" indicando patente y tiempo de permanencia. Facilita el acceso al servicio de estacionamiento regulado y complementa la aplicación móvil del SEM para inclusión digital y acceso universal.', 11, 6, '2021-12-31', '2025-03-31', 11, NULL, 'https://datos.comodoro.gov.ar/dataset/puntos-de-venta-del-sistema-de-estacionamiento-medido', NULL, 'externa', 1, '2025-12-02 13:11:36', '2025-12-06 02:39:29'),
(76, 'Estimación de Población y Viviendas 2021', 'Estimación de población y viviendas por barrios de Comodoro Rivadavia realizada por la Dirección de Investigación Territorial mediante conteo de viviendas basado en análisis de imágenes satelitales actualizadas a noviembre 2021. Proporciona datos demográficos estimados por unidad territorial para planificación urbana, diseño de políticas públicas y análisis de crecimiento poblacional local.', 14, 11, '2021-11-30', NULL, 8, NULL, 'https://datos.comodoro.gov.ar/dataset/estimacion-de-poblacion-y-viviendas-2021', NULL, 'interna', 1, '2025-12-02 13:50:54', '2025-12-06 02:39:29'),
(77, 'Población y Viviendas por Barrio Censo 2022', 'Datos oficiales del Censo Nacional de Población, Hogares y Viviendas 2022 procesados por la Dirección de Investigación Territorial, con información desagregada por barrios de Comodoro Rivadavia. Incluye cantidad de población y viviendas censadas en cada barrio según relevamiento oficial INDEC. Esta información constituye la fuente de datos demográficos más actualizada para planificación urbana, diseño de políticas públicas focalizadas territorialmente y estudios socioeconómicos barriales.', 29, 10, '2026-01-23', '2031-12-31', 8, NULL, 'https://datos.comodoro.gov.ar/dataset/poblacion-y-viviendas-por-barrio-censo-2022', NULL, 'externa', 1, '2026-01-26 14:36:56', '2026-01-26 14:36:56'),
(78, 'Población por Radio Censal Censo 2022', 'Cartografía oficial de radios censales de Comodoro Rivadavia con datos poblacionales del Censo Nacional 2022, procesada por la Dirección de Investigación Territorial. Los radios censales constituyen las unidades operativas oficiales de INDEC que subdividen exhaustivamente el territorio municipal. Esta información georreferenciada es fundamental para análisis demográfico, planificación territorial, diseño de políticas públicas focalizadas y estudios socioeconómicos según estándares nacionales.', 29, 10, '2026-01-26', '2031-12-31', 8, NULL, 'https://datos.comodoro.gov.ar/dataset/poblacion-por-radio-censal-censo-2022', NULL, 'externa', 1, '2026-01-26 14:38:51', '2026-01-26 14:38:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dataset_formatos`
--

CREATE TABLE `dataset_formatos` (
  `dataset_id` int(11) NOT NULL,
  `formato_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `dataset_formatos`
--

INSERT INTO `dataset_formatos` (`dataset_id`, `formato_id`) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2),
(3, 1),
(3, 2),
(4, 1),
(4, 2),
(5, 1),
(5, 2),
(6, 1),
(6, 2),
(7, 1),
(7, 2),
(8, 1),
(8, 2),
(9, 1),
(9, 2),
(10, 1),
(10, 2),
(11, 1),
(11, 2),
(12, 1),
(12, 2),
(12, 5),
(12, 7),
(13, 1),
(13, 2),
(14, 4),
(14, 20),
(15, 4),
(15, 20),
(16, 4),
(16, 20),
(17, 1),
(17, 2),
(17, 5),
(18, 1),
(18, 2),
(18, 5),
(18, 7),
(19, 1),
(19, 2),
(20, 1),
(20, 2),
(20, 5),
(20, 7),
(21, 1),
(21, 2),
(21, 5),
(21, 7),
(22, 1),
(22, 7),
(23, 1),
(23, 2),
(24, 1),
(24, 2),
(25, 1),
(25, 2),
(25, 5),
(25, 7),
(26, 1),
(26, 2),
(26, 6),
(26, 7),
(27, 1),
(27, 2),
(27, 5),
(27, 7),
(28, 1),
(28, 2),
(29, 1),
(29, 2),
(29, 5),
(29, 7),
(30, 1),
(30, 2),
(30, 5),
(31, 1),
(31, 7),
(32, 1),
(32, 2),
(33, 1),
(33, 2),
(34, 1),
(34, 2),
(35, 1),
(35, 2),
(36, 1),
(36, 2),
(37, 1),
(37, 2),
(37, 5),
(38, 1),
(38, 2),
(39, 1),
(39, 7),
(40, 1),
(40, 5),
(41, 4),
(41, 20),
(42, 1),
(42, 2),
(42, 6),
(43, 1),
(43, 2),
(43, 5),
(44, 1),
(44, 2),
(45, 1),
(45, 2),
(46, 1),
(46, 2),
(47, 4),
(47, 20),
(48, 1),
(48, 2),
(49, 1),
(49, 2),
(49, 6),
(50, 1),
(50, 2),
(51, 1),
(51, 2),
(51, 5),
(52, 1),
(52, 2),
(53, 1),
(53, 2),
(53, 6),
(54, 1),
(54, 2),
(54, 6),
(55, 1),
(55, 2),
(55, 5),
(55, 7),
(56, 1),
(56, 2),
(57, 1),
(57, 2),
(58, 1),
(58, 2),
(58, 5),
(59, 1),
(59, 2),
(59, 5),
(59, 7),
(60, 1),
(60, 5),
(61, 1),
(61, 2),
(62, 1),
(62, 5),
(63, 5),
(63, 7),
(64, 5),
(64, 7),
(65, 1),
(65, 7),
(66, 5),
(66, 7),
(67, 1),
(67, 2),
(67, 5),
(68, 1),
(68, 2),
(68, 5),
(69, 1),
(69, 2),
(70, 1),
(70, 2),
(71, 1),
(71, 2),
(72, 1),
(72, 2),
(73, 1),
(73, 2),
(74, 1),
(74, 2),
(75, 1),
(75, 5),
(76, 1),
(76, 2),
(77, 1),
(77, 2),
(78, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `formatos`
--

CREATE TABLE `formatos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `habitual` tinyint(1) DEFAULT 0,
  `extension` varchar(20) DEFAULT NULL,
  `tipo_mime` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `formatos`
--

INSERT INTO `formatos` (`id`, `nombre`, `habitual`, `extension`, `tipo_mime`, `activo`, `created_at`) VALUES
(1, 'CSV', 1, '.csv', 'text/csv', 1, '2025-12-09 23:42:31'),
(2, 'XLSX', 1, '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 1, '2025-12-09 23:42:31'),
(3, 'XLS', 1, '.xls', 'application/vnd.ms-excel', 1, '2025-12-09 23:42:31'),
(4, 'PDF', 1, '.pdf', 'application/pdf', 1, '2025-12-09 23:42:31'),
(5, 'KML', 1, '.kml', 'application/vnd.google-earth.kml+xml', 1, '2025-12-09 23:42:31'),
(6, 'KMZ', 1, '.kmz', 'application/vnd.google-earth.kmz', 1, '2025-12-09 23:42:31'),
(7, 'SHP', 1, '.shp', 'application/x-shapefile', 1, '2025-12-09 23:42:31'),
(8, 'JSON', 1, '.json', 'application/json', 1, '2025-12-09 23:42:31'),
(9, 'XML', 1, '.xml', 'application/xml', 1, '2025-12-09 23:42:31'),
(10, 'DOC', 1, '.doc', 'application/msword', 1, '2025-12-09 23:42:31'),
(11, 'DOCX', 0, '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1, '2025-12-09 23:42:31'),
(12, 'GeoJSON', 0, '.geojson', 'application/geo+json', 1, '2025-12-09 23:42:31'),
(13, 'GeoTIFF', 0, '.tif', 'image/tiff', 1, '2025-12-09 23:42:31'),
(14, 'GPX', 0, '.gpx', 'application/gpx+xml', 1, '2025-12-09 23:42:31'),
(15, 'DWG', 0, '.dwg', 'application/acad', 1, '2025-12-09 23:42:31'),
(16, 'DXF', 0, '.dxf', 'application/dxf', 1, '2025-12-09 23:42:31'),
(17, 'GDB', 0, '.gdb', 'application/x-filegdb', 1, '2025-12-09 23:42:31'),
(18, 'GPKG', 0, '.gpkg', 'application/geopackage+sqlite3', 1, '2025-12-09 23:42:31'),
(19, 'WKT', 0, '.wkt', 'text/plain', 1, '2025-12-09 23:42:31'),
(20, 'Markdown', 0, '.md', 'text/markdown', 1, '2025-12-09 23:42:31'),
(21, 'Texto plano', 0, '.txt', 'text/plain', 1, '2025-12-09 23:42:31'),
(22, 'HTML', 0, '.html', 'text/html', 1, '2025-12-09 23:42:31'),
(23, 'ODS', 0, '.ods', 'application/vnd.oasis.opendocument.spreadsheet', 1, '2025-12-09 23:42:31'),
(24, 'ODT', 0, '.odt', 'application/vnd.oasis.opendocument.text', 1, '2025-12-09 23:42:31'),
(25, 'ZIP', 0, '.zip', 'application/zip', 1, '2025-12-09 23:42:31'),
(26, 'RAR', 0, '.rar', 'application/vnd.rar', 1, '2025-12-09 23:42:31'),
(27, '7Z', 0, '.7z', 'application/x-7z-compressed', 1, '2025-12-09 23:42:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `frecuencias`
--

CREATE TABLE `frecuencias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `dias` int(11) DEFAULT NULL COMMENT 'Días entre actualizaciones. NULL para Eventual',
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `frecuencias`
--

INSERT INTO `frecuencias` (`id`, `nombre`, `dias`, `orden`, `activo`) VALUES
(1, 'Mensualmente', 30, 1, 1),
(2, 'Bimestralmente', 60, 2, 1),
(3, 'Trimestralmente', 90, 3, 1),
(4, 'Cuatrimestralmente', 120, 4, 1),
(5, 'Cada medio año', 180, 5, 1),
(6, 'Anualmente', 365, 6, 1),
(7, 'Cada dos años', 730, 7, 1),
(8, 'Cada tres años', 1095, 8, 1),
(9, 'Cada cuatro años', 1460, 9, 1),
(10, 'Cada diez años', 3650, 10, 1),
(11, 'Eventual', NULL, 11, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_actualizaciones`
--

CREATE TABLE `historial_actualizaciones` (
  `id` int(11) NOT NULL,
  `dataset_id` int(11) NOT NULL,
  `fecha_actualizacion` date NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `historial_actualizaciones`
--

INSERT INTO `historial_actualizaciones` (`id`, `dataset_id`, `fecha_actualizacion`, `usuario_id`, `notas`, `created_at`) VALUES
(1, 56, '2025-12-12', 2, NULL, '2025-12-12 11:28:19'),
(2, 45, '2025-12-15', 2, NULL, '2025-12-15 13:50:06'),
(3, 45, '2025-12-15', 2, NULL, '2025-12-15 13:50:18'),
(4, 67, '2025-12-15', 2, NULL, '2025-12-15 14:17:10'),
(5, 25, '2025-12-16', 2, NULL, '2025-12-16 11:55:26'),
(6, 51, '2025-12-16', 2, NULL, '2025-12-16 12:21:35'),
(7, 68, '2025-12-16', 2, NULL, '2025-12-16 12:57:34'),
(8, 68, '2025-12-16', 2, NULL, '2025-12-16 12:57:57'),
(9, 58, '2025-12-16', 2, NULL, '2025-12-16 14:47:48'),
(10, 45, '2025-12-16', 2, NULL, '2025-12-16 14:48:18'),
(11, 25, '2025-12-16', 2, NULL, '2025-12-16 14:49:06'),
(12, 51, '2025-12-16', 2, NULL, '2025-12-16 14:49:34'),
(13, 68, '2025-12-16', 2, NULL, '2025-12-16 14:50:04'),
(14, 61, '2025-12-17', 2, NULL, '2025-12-17 11:53:06'),
(15, 52, '2025-12-17', 2, NULL, '2025-12-17 11:54:29'),
(16, 3, '2025-12-17', 2, NULL, '2025-12-17 11:56:22'),
(17, 3, '2025-12-17', 2, NULL, '2025-12-17 11:56:56'),
(18, 5, '2025-12-17', 2, NULL, '2025-12-17 12:00:26'),
(19, 10, '2025-12-17', 2, NULL, '2025-12-17 12:02:21'),
(20, 9, '2025-12-17', 2, NULL, '2025-12-17 12:03:29'),
(21, 1, '2025-12-17', 2, NULL, '2025-12-17 12:04:21'),
(22, 57, '2025-12-17', 2, NULL, '2025-12-17 12:04:48'),
(23, 2, '2025-12-17', 2, NULL, '2025-12-17 12:09:50'),
(24, 32, '2025-12-19', 2, NULL, '2025-12-19 14:26:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones_log`
--

CREATE TABLE `notificaciones_log` (
  `id` int(11) NOT NULL,
  `tipo` enum('interno-60','interno-30','interno-vencido','externo-60','externo-40','externo-5','externo-vencido','area-aviso-40') NOT NULL,
  `area_id` int(11) DEFAULT NULL COMMENT 'NULL para notificaciones internas a DGMIT',
  `destinatarios` varchar(500) NOT NULL,
  `datasets_ids` varchar(500) NOT NULL COMMENT 'IDs separados por coma',
  `cantidad_datasets` int(11) NOT NULL DEFAULT 1,
  `enviado_at` timestamp NULL DEFAULT current_timestamp(),
  `success` tinyint(1) DEFAULT 1,
  `error_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `notificaciones_log`
--

INSERT INTO `notificaciones_log` (`id`, `tipo`, `area_id`, `destinatarios`, `datasets_ids`, `cantidad_datasets`, `enviado_at`, `success`, `error_message`) VALUES
(1, 'externo-vencido', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '11,13,75,27,58,25,56,32,8', 9, '2025-12-06 17:21:46', 1, NULL),
(2, 'externo-40', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '66', 1, '2025-12-07 03:38:10', 1, NULL),
(3, 'area-aviso-40', 5, 'datospublicos@comodoro.gov.ar,marianoaperez@yahoo.com.ar', '66', 1, '2025-12-07 03:38:12', 1, NULL),
(4, 'externo-40', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '66', 1, '2025-12-07 11:00:04', 1, NULL),
(5, 'area-aviso-40', 5, 'datospublicos@comodoro.gov.ar,marianoaperez@yahoo.com.ar', '66', 1, '2025-12-07 11:00:06', 1, NULL),
(6, 'externo-vencido', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '11,13,56,32,25,58,27,75,8', 9, '2025-12-10 23:49:30', 1, NULL),
(7, 'externo-40', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '70,71,73,72,69,4,61,48,46,52,3,2,7,6,35,5,23,10,9,57,1,36', 22, '2025-12-22 11:00:06', 1, NULL),
(8, 'area-aviso-40', 1, 'aip@comodoro.gov.ar', '9', 1, '2025-12-22 11:00:07', 1, NULL),
(9, 'area-aviso-40', 12, 'inspectoreshabilitacion@comodoro.gov.ar', '61', 1, '2025-12-22 11:00:09', 1, NULL),
(10, 'area-aviso-40', 13, 'dghigieneurbana@comodoro.gov.ar,generadoresespeciales24@gmail.com', '6', 1, '2025-12-22 11:00:10', 1, NULL),
(11, 'area-aviso-40', 18, 'adicionales@comodoro.gov.ar', '3', 1, '2025-12-22 11:00:12', 1, NULL),
(12, 'area-aviso-40', 19, 'relacioneslaborales@comodoro.gov.ar', '52', 1, '2025-12-22 11:00:13', 1, NULL),
(13, 'area-aviso-40', 21, 'transito@comodoro.gov.ar,administraciontransito@comodoro.gov.ar', '7', 1, '2025-12-22 11:00:14', 1, NULL),
(14, 'area-aviso-40', 23, 'veterinaria@comodoro.gov.ar', '4', 1, '2025-12-22 11:00:16', 1, NULL),
(15, 'area-aviso-40', 26, 'estadisticas@comodoroturismo.gob.ar,direccionturismo@comodoro.gov.ar', '23', 1, '2025-12-22 11:00:17', 1, NULL),
(16, 'area-aviso-40', 41, 'contacto@scplcr.com', '70,71,73,72,69,48,46', 7, '2025-12-22 11:00:18', 1, NULL),
(17, 'interno-vencido', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '34,26,43,31,17,62', 6, '2026-01-01 11:00:07', 1, NULL),
(18, 'externo-vencido', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '11,13,75,27,8', 5, '2026-01-01 11:00:08', 1, NULL),
(19, 'interno-vencido', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '31,34,26,43,17,62', 6, '2026-01-10 16:44:52', 1, NULL),
(20, 'externo-5', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '70,71,73,72,69,4,48,46,52,3,2,7,6,35,5,23,10,57,1,36', 20, '2026-01-26 11:00:10', 1, NULL),
(21, 'interno-60', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '38,60', 2, '2026-01-30 11:00:04', 1, NULL),
(22, 'externo-60', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '42,74', 2, '2026-01-30 11:00:06', 1, NULL),
(23, 'interno-vencido', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '31,34,26,43,17,62', 6, '2026-02-01 11:00:05', 1, NULL),
(24, 'externo-vencido', NULL, 'datospublicos@comodoro.gov.ar,mit@comodoro.gov.ar,investigacionterritorial@comodoro.gov.ar', '11,13,9,75,27,8,6,46,71,5,1,69,2,10,7,48,72,4,23,70,3,52,57,73', 24, '2026-02-01 11:00:06', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temas`
--

CREATE TABLE `temas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `temas`
--

INSERT INTO `temas` (`id`, `nombre`, `icono`, `orden`, `activo`) VALUES
(1, 'Economía y Finanzas', 'coins', 1, 1),
(2, 'Educación y Cultura', 'graduation-cap', 2, 1),
(3, 'Geografía y Territorio', 'map', 3, 1),
(4, 'Gobierno y Gestión Pública', 'landmark', 4, 1),
(5, 'Infraestructura y Equipamiento Urbano', 'building', 5, 1),
(6, 'Marco Legal, Elecciones y Seguridad', 'scale', 6, 1),
(7, 'Medio Ambiente', 'leaf', 7, 1),
(8, 'Población y Sociedad', 'users', 8, 1),
(9, 'Salud, Género y Desarrollo Social', 'heart-pulse', 9, 1),
(10, 'Servicios Públicos', 'wrench', 10, 1),
(11, 'Transporte y Movilidad', 'bus', 11, 1),
(12, 'Turismo y Deportes', 'plane', 12, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `rol` enum('admin','lector') NOT NULL DEFAULT 'admin',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `password_hash`, `nombre_completo`, `email`, `rol`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'MAPEREZ', '$2a$10$k7REGha8GXbRTweZLa.pueM0tsPn8g7cfdL9Qq1IrxayIHizfbqTq', 'Mariano Ariel Perez', 'marianoaperez@yahoo.com.ar', 'admin', 1, '2025-11-30 21:20:04', '2026-01-11 01:18:36'),
(2, 'ANBARROSO', '$2a$10$H53B9iq27YCqQAVoCr1EteRzsImMqmgzk.80I2xD5hi4cx77eDiOK', 'Aldana Noelia Barroso', 'aldanabarroso16.dit@gmail.com', 'admin', 1, '2025-11-30 21:32:14', '2026-01-26 17:44:28'),
(3, 'ANNAVARRO', '$2a$10$8UAiODStyggM3LSUuqPllePZmNolSmwmT33YlkEDdygXoo7DYuaqa', 'Ana Noemi Navarro', 'investigacionterritorial@comodoro.gov.ar', 'lector', 1, '2025-12-10 15:19:52', '2026-01-11 00:52:21'),
(4, 'GALOPEZ', '$2a$12$yCvIBfWVDSr1/clO/LhGHuqZ5u0CBwsGwBpMZsRwyjTn7KcQr77c2', 'Gustavo Angel Lopez', 'mit@comodoro.gov.ar', 'admin', 1, '2025-12-10 15:21:22', '2026-01-23 13:49:59'),
(5, 'MASAEZ', '$2a$10$Dljya6Xl1kOMUGq.DvPVZu/HTXUStUFTyBSXC8QSedsWmQIxgLdBG', 'Melanie Abigail Sáez', 'smelanie.dit@gmail.com', 'lector', 1, '2026-01-11 01:26:16', '2026-01-11 01:26:16'),
(6, 'AARODRIGUEZ', '$2a$10$VhgxFfUe/ohlgonXT.V6FOedKXrgFWbgSxxdgwaZtlmDbHrULAdZK', 'Agustín Alejandro Rodríguez', 'geoestadisticas@comodoro.gov.ar', 'lector', 1, '2026-01-11 01:26:16', '2026-01-11 01:26:16'),
(7, 'VAGOMEZ', '$2a$10$PRQF.fiq9QBjJ6bPgFaO1e.QtHPmXmajfuROWjmsP/sS6753UuubG', 'Valeria Adriana Gómez', 'valeriagomez.dit@gmail.com', 'admin', 1, '2026-01-11 01:26:16', '2026-01-11 01:26:16'),
(8, 'SBARANEDA', '$2a$10$3PNG7xeyZpnT53xz3.HhZOGJzQYVP2BGQ8cyCQNR16TVttsJJZwNG', 'Susana Beatriz Araneda', 'saraneda247@gmail.com', 'lector', 1, '2026-01-11 01:26:16', '2026-01-11 01:26:16'),
(9, 'MVNAVARRO', '$2a$10$UC9HX.hrZ6d4dwzYTLCnuukwDi4WQrv2abPMdKbjd.htcq9foOaxO', 'Manuela Vanesa Navarro', '', 'lector', 1, '2026-01-11 01:26:16', '2026-01-11 01:26:16');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre_unique` (`nombre`),
  ADD KEY `idx_areas_nombre` (`nombre`);

--
-- Indices de la tabla `cambios_pendientes`
--
ALTER TABLE `cambios_pendientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `revisor_id` (`revisor_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_dataset` (`dataset_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indices de la tabla `datasets`
--
ALTER TABLE `datasets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_datasets_tema_principal` (`tema_principal_id`),
  ADD KEY `idx_datasets_tema_secundario` (`tema_secundario_id`),
  ADD KEY `idx_datasets_frecuencia` (`frecuencia_id`),
  ADD KEY `idx_datasets_proxima_actualizacion` (`proxima_actualizacion`),
  ADD KEY `idx_datasets_activo` (`activo`),
  ADD KEY `idx_datasets_area_id` (`area_id`);

--
-- Indices de la tabla `dataset_formatos`
--
ALTER TABLE `dataset_formatos`
  ADD PRIMARY KEY (`dataset_id`,`formato_id`),
  ADD KEY `formato_id` (`formato_id`);

--
-- Indices de la tabla `formatos`
--
ALTER TABLE `formatos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `frecuencias`
--
ALTER TABLE `frecuencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `historial_actualizaciones`
--
ALTER TABLE `historial_actualizaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_historial_dataset` (`dataset_id`);

--
-- Indices de la tabla `notificaciones_log`
--
ALTER TABLE `notificaciones_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notificaciones_tipo` (`tipo`),
  ADD KEY `idx_notificaciones_area` (`area_id`),
  ADD KEY `idx_notificaciones_fecha` (`enviado_at`);

--
-- Indices de la tabla `temas`
--
ALTER TABLE `temas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `cambios_pendientes`
--
ALTER TABLE `cambios_pendientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `datasets`
--
ALTER TABLE `datasets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT de la tabla `formatos`
--
ALTER TABLE `formatos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `frecuencias`
--
ALTER TABLE `frecuencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `historial_actualizaciones`
--
ALTER TABLE `historial_actualizaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `notificaciones_log`
--
ALTER TABLE `notificaciones_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `temas`
--
ALTER TABLE `temas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cambios_pendientes`
--
ALTER TABLE `cambios_pendientes`
  ADD CONSTRAINT `cambios_pendientes_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cambios_pendientes_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cambios_pendientes_ibfk_3` FOREIGN KEY (`revisor_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `datasets`
--
ALTER TABLE `datasets`
  ADD CONSTRAINT `datasets_ibfk_1` FOREIGN KEY (`frecuencia_id`) REFERENCES `frecuencias` (`id`),
  ADD CONSTRAINT `datasets_ibfk_2` FOREIGN KEY (`tema_principal_id`) REFERENCES `temas` (`id`),
  ADD CONSTRAINT `datasets_ibfk_3` FOREIGN KEY (`tema_secundario_id`) REFERENCES `temas` (`id`),
  ADD CONSTRAINT `fk_datasets_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`);

--
-- Filtros para la tabla `dataset_formatos`
--
ALTER TABLE `dataset_formatos`
  ADD CONSTRAINT `dataset_formatos_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `dataset_formatos_ibfk_2` FOREIGN KEY (`formato_id`) REFERENCES `formatos` (`id`);

--
-- Filtros para la tabla `historial_actualizaciones`
--
ALTER TABLE `historial_actualizaciones`
  ADD CONSTRAINT `historial_actualizaciones_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `historial_actualizaciones_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `notificaciones_log`
--
ALTER TABLE `notificaciones_log`
  ADD CONSTRAINT `notificaciones_log_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
