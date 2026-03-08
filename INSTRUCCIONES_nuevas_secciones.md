# Nuevas Secciones del RPAD: Métricas y Proyectos

**Fecha:** Marzo 2026
**Autor:** Dirección de Datos Públicos y Comunicación
**Dirección General de Modernización e Investigación Territorial**
**Subsecretaría de Modernización y Transparencia**

---

## 1. Introducción

El **Registro Permanente de Actualización de Datasets (RPAD)** es la herramienta interna de la Dirección de Datos Públicos para gestionar, monitorear y notificar el estado de los datasets publicados en el portal de datos abiertos de la Municipalidad de Comodoro Rivadavia.

Actualmente, el RPAD permite:
- Registrar y administrar datasets con sus áreas responsables
- Enviar notificaciones automáticas de vencimiento
- Generar reportes PDF de estado y cumplimiento
- Certificar archivos mediante blockchain (BFA)

Sin embargo, **falta una herramienta que permita cuantificar y comunicar el trabajo realizado por la Dirección**, así como **mostrar los proyectos que impulsa** más allá del registro de datasets.

Las nuevas secciones de **Métricas** y **Proyectos** buscan cubrir estas necesidades.

---

## 2. Valor Estratégico

### 2.1. Rendición de cuentas
Las métricas permiten responder con datos concretos preguntas como:
- ¿Cuántos datasets se actualizaron este mes?
- ¿Cuántas notas se enviaron a otras áreas?
- ¿Cuál es la tasa de cumplimiento de las áreas?
- ¿Cuántas reuniones o capacitaciones se realizaron?

### 2.2. Mejora continua
Al visualizar tendencias mensuales, se pueden identificar:
- Meses con baja actividad
- Áreas que requieren más seguimiento
- Operadores que necesitan apoyo o reconocimiento

### 2.3. Evidencia para presupuesto y planificación
Un dashboard con KPIs y gráficos proporciona material objetivo para:
- Presentaciones ante superiores
- Solicitudes de recursos
- Informes de gestión trimestrales/anuales

### 2.4. Visibilidad de proyectos
La Dirección impulsa proyectos que trascienden el registro de datasets (BFA, Boletín Oficial, normativas). Tener un registro centralizado con hitos y evidencias permite:
- Mostrar el avance de cada proyecto
- Documentar logros con fechas y evidencias
- Categorizar iniciativas por área temática

---

## 3. Sección Métricas

### 3.1. Métricas Automáticas

Se calculan directamente desde la base de datos existente, sin carga manual:

| Métrica | Fuente | Descripción |
|---------|--------|-------------|
| Datasets actualizados por mes | `historial_actualizaciones` | Cantidad de actualizaciones registradas por mes |
| Datasets creados por mes | `datasets` | Nuevos datasets ingresados al sistema |
| Notificaciones enviadas por mes | `notificaciones_log` | Emails enviados a áreas y equipo interno |
| Cambios aprobados/rechazados por mes | `cambios_pendientes` | Flujo de doble verificación |
| Tiempo promedio de aprobación | `cambios_pendientes` | Días entre creación y revisión |
| Operador más activo | `historial_actualizaciones` + `cambios_pendientes` | Usuario con más acciones en el período |
| Distribución por tema y frecuencia | `datasets` | Proporción de datasets por categoría |
| Tasa de cumplimiento histórica | `datasets` | Evolución mensual del % de datasets al día |
| Ranking de áreas | `datasets` | Áreas ordenadas por cumplimiento |

### 3.2. Métricas Manuales

Permiten registrar actividades que ocurren fuera del sistema:

| Tipo | Ejemplo |
|------|---------|
| Notas enviadas | Notas formales creadas fuera del RPAD |
| Reuniones/capacitaciones | Encuentros con áreas, capacitaciones brindadas |
| Consultas atendidas | Consultas recibidas y resueltas |

**Carga:** Formulario simple con tipo, mes/año y cantidad. Solo administradores pueden cargar.

### 3.3. Dashboard Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    MÉTRICAS DE GESTIÓN                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    42     │  │    8     │  │   15     │  │   92%    │   │
│  │ Datasets  │  │ Datasets │  │  Notas   │  │ Cumplim. │   │
│  │actualiz.  │  │ creados  │  │ enviadas │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │  Actualizaciones/mes    │  │  Notificaciones/mes     │  │
│  │  ▓▓▓▓▓▓▓▓░░ (bar chart)│  │  ▓▓▓▓▓▓▓▓░░ (bar chart)│  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │  Distribución por tema  │  │  Ranking de áreas       │  │
│  │  ████ (donut chart)     │  │  1. Área X - 100%       │  │
│  │                         │  │  2. Área Y - 95%        │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **Cards KPI** en la parte superior con cifras clave del período seleccionado
- **Gráficos Chart.js** con barras y donas para tendencias
- **Selector de rango**: últimos 12 meses por defecto, configurable
- **Exportación**: PDF con gráficos incluidos + CSV con datos crudos

---

## 4. Sección Proyectos

### 4.1. Datos de cada proyecto

| Campo | Descripción |
|-------|-------------|
| Nombre | Título del proyecto |
| Descripción corta | Resumen en 1-2 oraciones |
| Estado | En curso / Completado / Suspendido / Idea |
| Fecha de inicio | Cuándo arrancó el proyecto |
| Ícono o color | Identificador visual |
| Área/s involucradas | Selección múltiple de áreas del RPAD |
| Responsable/referente | Persona a cargo |
| Enlace externo | URL a recurso relacionado |
| Prioridad | Alta / Media / Baja |
| Documentos adjuntos | PDFs, presentaciones (hasta 5 por proyecto) |
| Categoría | Tecnología / Normativa / Difusión |

### 4.2. Hitos

Cada proyecto puede tener múltiples hitos que documentan avances:

| Campo | Descripción |
|-------|-------------|
| Título | Nombre del logro o avance |
| Fecha | Cuándo ocurrió |
| Descripción breve | Detalle en 1-2 oraciones |
| Evidencia | Archivo adjunto o enlace externo |

### 4.3. Vistas

**Vista de lista (por defecto):**
Proyectos agrupados por categoría (Tecnología / Normativa / Difusión), con cards que muestran estado, prioridad y cantidad de hitos.

```
┌─────────────────────────────────────────────────────────────┐
│  TECNOLOGÍA                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ 🔵 BFA               │  │ 🟢 Boletín Oficial   │        │
│  │ En curso | Alta      │  │ Completado | Media   │        │
│  │ 4 hitos              │  │ 6 hitos              │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  NORMATIVA                                                  │
│  ┌──────────────────────┐                                   │
│  │ 🟡 Ord. 17.662       │                                   │
│  │ Completado | Alta    │                                   │
│  │ 3 hitos              │                                   │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

**Vista timeline:**
Línea de tiempo visual con hitos de todos los proyectos, ordenados cronológicamente. Permite ver en qué momentos del año hubo avances y en cuáles no.

---

## 5. Permisos y Acceso

| Rol | Acceso |
|-----|--------|
| **Administrador** | Ver dashboard, cargar métricas manuales, CRUD completo de proyectos y hitos |
| **Lector** (usuario autenticado) | Solo visualización del dashboard, métricas y proyectos |
| **No autenticado** | Sin acceso a la sección Gestión |

La sección se accede desde una nueva entrada **"Gestión"** en el menú lateral, visible solo para usuarios autenticados.

---

## 6. Implementación Técnica (Resumen)

### 6.1. Archivos nuevos

| Archivo | Propósito |
|---------|-----------|
| `public/gestion.html` | Página principal con tabs Métricas y Proyectos |
| `public/js/gestion.js` | Lógica frontend (dashboard, CRUD, gráficos) |
| `controllers/gestionController.js` | Endpoints API para métricas y proyectos |
| `database/updates/migracion-metricas-proyectos.sql` | Creación de tablas nuevas |

### 6.2. Archivos modificados (cambios mínimos)

| Archivo | Cambio |
|---------|--------|
| `routes/index.js` | Agregar rutas de gestión al final |
| `public/js/main.js` | Agregar ítem "Gestión" al sidebar (no aplica: sidebar está en HTML) |

### 6.3. Tablas nuevas en base de datos

- `metricas_manuales` — Registro de métricas cargadas manualmente
- `proyectos` — Catálogo de proyectos de la Dirección
- `proyecto_areas` — Relación muchos-a-muchos entre proyectos y áreas
- `proyecto_documentos` — Archivos adjuntos de cada proyecto
- `proyecto_hitos` — Hitos/logros dentro de cada proyecto

### 6.4. Compatibilidad con branch blockchain

Esta implementación utiliza **archivos 100% nuevos**, evitando conflictos con la rama `feature/blockchain-integration` que está pendiente de aprobación. Los únicos puntos de contacto son:
- `routes/index.js` — las rutas se agregan al final del archivo
- Sidebar en HTML — se agrega una sección nueva

Ambos casos son fácilmente resolvibles en caso de conflicto de merge.

---

## 7. Cronograma Estimado

| Fase | Descripción |
|------|-------------|
| **Fase 1** | Estructura base: migración BD, controller, HTML, rutas |
| **Fase 2** | Dashboard de métricas automáticas con gráficos Chart.js |
| **Fase 3** | CRUD de métricas manuales y exportación CSV |
| **Fase 4** | CRUD de proyectos con hitos y documentos adjuntos |
| **Fase 5** | Timeline visual de hitos + exportación PDF |
| **Fase 6** | Testing, ajustes de permisos, integración final |

---

## 8. Conclusión

Las secciones de **Métricas** y **Proyectos** transforman al RPAD de un sistema de registro y notificación en una **herramienta integral de gestión** para la Dirección de Datos Públicos. Permiten:

- **Cuantificar** el trabajo realizado con datos objetivos
- **Comunicar** resultados ante superiores con dashboards y reportes
- **Documentar** los proyectos estratégicos con evidencias y cronología
- **Identificar** oportunidades de mejora a través de tendencias

Todo esto se logra con una implementación modular que no afecta el funcionamiento actual del sistema y es compatible con los desarrollos en curso.
