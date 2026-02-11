![RPAD - Registro Permanente de Actualización de Datasets](public/img/logo-2025.png)

# RPAD - Registro Permanente de Actualización de Datasets

Sistema de gestión y certificación blockchain del catálogo de datos abiertos de la Municipalidad de Comodoro Rivadavia.

**Versión actual:** 2.0.0

---

## Descripción

RPAD permite registrar datasets del Portal de Datos Abiertos municipal, asignarles frecuencias de actualización y monitorear su estado. El tablero de seguimiento muestra estadísticas en tiempo real sobre datasets actualizados, próximos a vencer y vencidos, diferenciando entre gestión interna y externa.

El sistema implementa **doble verificación**: un operador propone cambios y un segundo operador los aprueba o rechaza antes de que se apliquen.

Desde la versión 2.0.0, cada cambio aprobado se **sella automáticamente en la Blockchain Federal Argentina (BFA)**, generando un registro inmutable y verificable públicamente. Opcionalmente, se puede certificar el contenido de los archivos de datos (CSV, XLSX, etc.) mediante su hash SHA-256.

---

## Stack tecnológico

| Componente | Tecnología |
|-----------|-----------|
| **Backend** | Node.js v22 + Express.js (ES Modules) |
| **Base de datos** | MariaDB 10.11 (mysql2/promise) |
| **Frontend** | HTML5 + CSS3 + JavaScript vanilla |
| **Iconos** | Lucide Icons (CDN) |
| **Autenticación** | JWT (jsonwebtoken) |
| **Seguridad** | Helmet (CSP, headers), express-rate-limit, bcryptjs |
| **Blockchain** | BFA (Blockchain Federal Argentina) — red PoA |
| **Librería blockchain** | web3.js v4 |
| **Contrato inteligente** | TSA2 (Stamper.sol) — sellado de hashes SHA-256 |
| **Gráficos** | Chart.js (CDN) |
| **Calendario** | FullCalendar.js (CDN) |
| **QR** | qrcode-generator v1.4.4 (CDN) |
| **Email** | Nodemailer 8.x |
| **PDFs** | PDFKit |
| **DOCX** | docx |

---

## Funcionalidades

### Gestión de datasets
- CRUD completo de datasets con clasificación por temas, frecuencias y formatos
- Relación muchos-a-muchos entre datasets y formatos de archivo
- Importación automática de metadatos desde portal Andino
- Diferenciación entre gestión interna y externa
- Estadísticas en tiempo real (actualizados, próximos a vencer, vencidos)
- Filtros por tema, frecuencia, estado, área y búsqueda libre

### Doble verificación
- Un operador propone un cambio (crear, editar, actualizar, eliminar)
- Un segundo operador distinto aprueba o rechaza
- Cola de cambios pendientes con detalle de datos nuevos y anteriores
- Registro de revisor y comentario de rechazo

### Certificación blockchain (BFA)
- Sellado automático de cambios aprobados en blockchain (hash de operación)
- Certificación obligatoria de archivos al marcar como actualizado (hash SHA-256)
- Certificación opcional de archivos al crear datasets
- Certificación voluntaria mediante botón "Certificar archivo"
- Sello fundacional del estado completo del sistema
- Verificador público de registros (`verificar.html`) sin requerir login
- Card de certificación en detalle de dataset con QR y link a BFA Explorer
- Cola de reintentos automáticos para sellos fallidos (hasta 10 intentos)
- Modo degradado: si blockchain no está disponible, RPAD sigue funcionando

### Drag & drop de archivos
- Zona de arrastre en modales "Marcar como actualizado" (obligatorio) y "Nuevo Dataset" (opcional)
- Hash SHA-256 calculado en el navegador (Web Crypto API) — el archivo nunca viaja al servidor
- Modal de certificación voluntaria con misma mecánica

### Notificaciones por email
- Alertas automáticas según tipo de gestión y días restantes
- Notificación de cambios pendientes de aprobación
- Plantillas HTML institucionales
- Cron job configurable para ejecución diaria

### Reportes y documentos
- Reporte PDF de estado general
- Reporte PDF de cumplimiento
- Reporte PDF por área
- Historial de notificaciones PDF
- Generador de notas administrativas DOCX (internas y externas)

### Calendario
- Vista mensual interactiva con FullCalendar.js
- Colores por estado (verde/amarillo/rojo)
- Filtros por área y tema
- Exportación a iCal (.ics)

### Otras funcionalidades
- Tablero con gráfico de dona y stat cards clickeables
- Formulario de contacto público
- Perfil de usuario y cambio de contraseña
- Integración con API de Andino (portal de datos abiertos)

---

## Roles de usuario

| Rol | Permisos |
|-----|----------|
| `admin` | Proponer y aprobar/rechazar cambios. Gestionar datasets y áreas. Certificar archivos en blockchain. Configurar notificaciones. Generar reportes y notas. |
| `lector` | Ver todas las secciones (tablero, calendario, datasets, áreas, reportes, notas) sin poder modificar datos. |

### Modelo de acceso

| Recurso | Público | Lector | Admin |
|---------|---------|--------|-------|
| Datasets (lectura), catálogos, áreas (lectura) | Si | Si | Si |
| Login, verificación blockchain pública | Si | Si | Si |
| Reportes PDF, notas DOCX, perfil | No | Si | Si |
| Datasets CRUD, áreas CRUD | No | No | Si |
| Cambios pendientes (gestión) | No | No | Si |
| Blockchain estado/certificar | No | No | Si |
| Notificaciones (ejecución, config) | No | No | Si |
| Cron endpoints | Secret | Secret | Secret |

---

## Estructura del proyecto

```
rpad/
├── app.js                              # Entry point — Express server
├── package.json
├── CLAUDE.md                           # Instrucciones para IA
├── RPAD_BFA_Resumen_Proyecto.md        # Documentación técnica blockchain
├── config/
│   └── database.js                     # Pool de conexiones MariaDB
├── controllers/
│   ├── authController.js               # Login, verificación, cambio de password, perfil
│   ├── catalogController.js            # Temas, frecuencias, formatos
│   ├── datasetController.js            # CRUD datasets, estadísticas, registrar actualización
│   ├── areasController.js              # CRUD áreas responsables
│   ├── andinoController.js             # Integración con portal Andino
│   ├── cambiosPendientesController.js  # Doble verificación + sellado blockchain
│   ├── blockchainController.js         # Verificación, estado, registro, certificación
│   ├── contactoController.js           # Formulario de contacto público
│   ├── notificacionesController.js     # Alertas por email y cambios pendientes
│   ├── notasController.js              # Generador de notas DOCX
│   └── reportesController.js           # Generación de reportes PDF
├── services/
│   ├── blockchainService.js            # Conexión BFA, sellado, verificación, reintentos
│   ├── emailService.js                 # Configuración SMTP y envío
│   └── emailTemplates.js              # Plantillas HTML para emails
├── middleware/
│   └── auth.js                         # JWT auth + adminOnly
├── routes/
│   └── index.js                        # Definición de todas las rutas API
├── database/
│   ├── schema.sql                      # Esquema completo de la BD
│   └── updates/                        # Scripts de migración
│       ├── migracion-v1.2.0-v1.3.0.sql
│       ├── migracion-v1.3.0-v1.4.0.sql
│       └── migracion-v1.4.0-v1.5.0.sql
├── scripts/
│   ├── setup-admin.js                  # Crear usuario administrador
│   └── sello-fundacional.js            # Ejecutar sello fundacional (una vez)
└── public/                             # FRONTEND
    ├── index.html                      # Tablero de seguimiento
    ├── datasets.html                   # Listado de datasets
    ├── dataset.html                    # Detalle de dataset + card blockchain
    ├── login.html                      # Formulario de login
    ├── admin.html                      # Panel de administración de datasets
    ├── areas.html                      # Gestión de áreas
    ├── correos.html                    # Configuración de correos
    ├── reportes.html                   # Generador de reportes PDF
    ├── calendario.html                 # Calendario interactivo
    ├── notas.html                      # Generador de notas DOCX
    ├── perfil.html                     # Perfil de usuario
    ├── contacto.html                   # Formulario de contacto público
    ├── verificar.html                  # Verificador público de blockchain
    ├── css/
    │   └── styles.css
    ├── js/
    │   ├── config.js                   # Configuración (API_URL)
    │   ├── main.js                     # Layout, navegación, sidebar
    │   ├── auth.js                     # Manejo de autenticación
    │   ├── api.js                      # Llamadas a la API
    │   ├── dashboard.js                # Tablero y gráficos
    │   ├── datasets.js                 # Listado de datasets
    │   ├── dataset-detail.js           # Detalle + card blockchain + QR
    │   ├── admin.js                    # Panel admin, modales, drag & drop, certificar
    │   ├── areas.js                    # Gestión de áreas
    │   ├── correos.js                  # Configuración de correos
    │   ├── reportes.js                 # Generación de reportes
    │   ├── calendario.js               # Calendario interactivo
    │   ├── notas.js                    # Generador de notas
    │   ├── perfil.js                   # Perfil de usuario
    │   └── contacto.js                 # Formulario de contacto
    └── img/
        ├── logo-2025.png
        ├── logo-2025-blanco.png
        ├── logo.png
        ├── icon.png
        └── bfa.svg                     # Logo Blockchain Federal Argentina
```

---

## Base de datos

### Estructura de tablas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios del sistema (admin y lector), con password hash bcrypt |
| `datasets` | Registro principal de datasets con clasificación, fechas y tipo de gestión |
| `dataset_formatos` | Relación muchos-a-muchos entre datasets y formatos |
| `cambios_pendientes` | Cola de cambios propuestos pendientes de aprobación (doble verificación) |
| `areas` | Áreas responsables con contactos, emails y artículos gramaticales |
| `temas` | Catálogo de temas para clasificación (12 categorías) |
| `frecuencias` | Catálogo de frecuencias de actualización (mensual a eventual) |
| `formatos` | Catálogo de formatos de archivo (CSV, XLSX, KML, SHP, etc.) |
| `notificaciones_log` | Registro de notificaciones enviadas por email |
| `historial_actualizaciones` | Legacy — no se usa desde v1.5 |
| `blockchain_registros` | Registros de sellado en BFA (hash, tx, bloque, estado, metadata) |

### Tabla blockchain_registros

```sql
CREATE TABLE blockchain_registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('cambio_dataset', 'certificacion_archivo', 'sello_fundacional') NOT NULL,
  referencia_id INT DEFAULT NULL,
  dataset_id INT DEFAULT NULL,
  hash_sellado VARCHAR(66) NOT NULL,
  file_hash VARCHAR(66) DEFAULT NULL,
  tx_hash VARCHAR(66) DEFAULT NULL,
  block_number BIGINT DEFAULT NULL,
  network VARCHAR(20) DEFAULT 'produccion',
  estado ENUM('pendiente', 'confirmado', 'error') DEFAULT 'pendiente',
  intentos INT DEFAULT 0,
  error_detalle TEXT DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL DEFAULT NULL
);
```

### Migración a v2.0.0

Si se actualiza desde v1.5.0:

1. Crear la tabla `blockchain_registros` (ver esquema arriba)
2. Agregar tipo_cambio `'actualizar'` al ENUM de `cambios_pendientes`:
```sql
ALTER TABLE cambios_pendientes
MODIFY COLUMN tipo_cambio ENUM('crear','editar','eliminar','actualizar') NOT NULL;
```

---

## API Endpoints

### Públicos (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Iniciar sesión (rate limited: 10/15min) |
| GET | `/api/datasets` | Listar datasets (con filtros) |
| GET | `/api/datasets/estadisticas` | Estadísticas para tablero |
| GET | `/api/datasets/:id` | Detalle de un dataset |
| GET | `/api/catalogos/temas` | Listar temas |
| GET | `/api/catalogos/frecuencias` | Listar frecuencias |
| GET | `/api/catalogos/formatos` | Listar formatos |
| GET | `/api/areas` | Listar áreas activas |
| GET | `/api/areas/:id` | Detalle de un área |
| GET | `/api/andino/fetch?url=...` | Obtener metadatos desde portal Andino |
| POST | `/api/contacto` | Enviar formulario de contacto |
| GET | `/api/blockchain/verificar/:hash` | Verificar hash en blockchain |
| GET | `/api/blockchain/registro` | Listado paginado de operaciones selladas |
| GET | `/api/blockchain/dataset/:id` | Registros blockchain de un dataset |

### Filtros disponibles en `/api/datasets`

- `?tema=ID` — Filtrar por tema
- `?frecuencia=ID` — Filtrar por frecuencia
- `?estado=actualizado|proximo|atrasado|sin-respuesta` — Filtrar por estado
- `?busqueda=texto` — Buscar en título y descripción
- `?area=ID` — Filtrar por área responsable

### Filtros disponibles en `/api/blockchain/registro`

- `?page=N` — Página (default: 1)
- `?limit=N` — Registros por página (default: 20, max: 50)
- `?area_id=ID` — Filtrar por área
- `?tipo_cambio=tipo` — Filtrar por tipo de registro

### Protegidos (requieren JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/verify` | Verificar sesión activa |
| POST | `/api/auth/change-password` | Cambiar contraseña |
| GET | `/api/auth/profile` | Obtener perfil |
| PUT | `/api/auth/profile` | Actualizar perfil |

### Protegidos (requieren JWT + rol admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/datasets` | Crear dataset (via cambio pendiente) |
| PUT | `/api/datasets/:id` | Editar dataset (via cambio pendiente) |
| DELETE | `/api/datasets/:id` | Eliminar dataset (via cambio pendiente) |
| POST | `/api/datasets/:id/actualizar` | Registrar actualización (requiere file_hash) |
| POST | `/api/areas` | Crear área |
| PUT | `/api/areas/:id` | Actualizar área |
| DELETE | `/api/areas/:id` | Eliminar área |
| GET | `/api/cambios-pendientes/contador` | Cantidad de cambios pendientes |
| GET | `/api/cambios-pendientes/para-revisar` | Cambios para revisar (de otros) |
| GET | `/api/cambios-pendientes/mis-cambios` | Mis cambios propuestos |
| GET | `/api/cambios-pendientes/datasets-bloqueados` | Datasets con cambios pendientes |
| GET | `/api/cambios-pendientes/verificar/:datasetId` | Verificar si dataset tiene cambio pendiente |
| GET | `/api/cambios-pendientes/:id` | Detalle de un cambio pendiente |
| POST | `/api/cambios-pendientes/:id/aprobar` | Aprobar cambio pendiente |
| POST | `/api/cambios-pendientes/:id/rechazar` | Rechazar cambio pendiente |
| GET | `/api/blockchain/estado` | Estado del servicio blockchain |
| POST | `/api/blockchain/certificar` | Certificar archivo (rate limited: 5/min) |
| POST | `/api/notificaciones/ejecutar` | Ejecutar notificaciones diarias |
| GET | `/api/notificaciones/prueba/:tipo` | Enviar email de prueba |
| GET | `/api/notificaciones/verificar-smtp` | Verificar conexión SMTP |
| GET | `/api/notificaciones/preview/:tipo` | Previsualizar email |
| POST | `/api/notificaciones/cambios-pendientes` | Notificar cambios pendientes |
| GET | `/api/notificaciones/preview-cambios-pendientes` | Preview notificación cambios |

### Reportes y notas (requieren JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reportes/estado-general` | Reporte PDF general |
| GET | `/api/reportes/historial-notificaciones` | Historial de notificaciones PDF |
| GET | `/api/reportes/por-area/:areaId` | Reporte PDF de un área |
| GET | `/api/reportes/cumplimiento` | Reporte de cumplimiento PDF |
| POST | `/api/notas/generar` | Generar nota administrativa DOCX |

### Cron (requiere secret)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/cron/notificaciones` | Ejecutar notificaciones (cron, header `x-cron-secret`) |
| POST | `/api/cron/cambios-pendientes` | Notificar cambios pendientes (cron, header `x-cron-secret`) |

---

## Variables de entorno

```env
# Servidor
PORT=3001
CORS_ORIGIN=https://tu-dominio.com

# Base de datos (MariaDB)
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos
DB_PORT=3306

# Seguridad
JWT_SECRET=clave_secreta_larga_y_aleatoria
CRON_SECRET=clave_para_cron_jobs

# SMTP (notificaciones por email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_cuenta@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx

# Blockchain BFA (obligatorias para sellado)
BFA_RPC_URL=http://167.86.71.102:443
BFA_CONTRACT_ADDRESS=0x7e56220069CAaF8367EA42817EA9210296AeC7c6
BFA_CHAIN_ID=200941592
BFA_WALLET_ADDRESS=0x53c4D8cb6f5Fb6BaFC3b158ae582a8Fb18dCc1C9
BFA_KEYFILE_PATH=/ruta/al/keyfile.json
BFA_WALLET_PASSWORD=password_del_keyfile

# Blockchain BFA (opcionales)
BFA_NETWORK=produccion
BFA_GAS_LIMIT=2000000
```

### Modos de operación blockchain

| Variables configuradas | Modo |
|----------------------|------|
| Ninguna BFA_* | Blockchain deshabilitada — RPAD funciona sin certificación |
| BFA_RPC_URL + BFA_CONTRACT_ADDRESS + BFA_WALLET_ADDRESS | Modo lectura — verifica sellos pero no puede crear nuevos |
| Todas las BFA_* | Modo completo — sellado y verificación |

> **Nota sobre JWT_SECRET:** Si no se configura, el servidor no arranca (fail-fast). No tiene fallback.

---

## Instalación

### 1. Clonar y configurar

```bash
git clone <repo>
cd rpad
cp .env.example .env   # Completar variables de entorno
npm install
```

### 2. Base de datos

Crear una base de datos MariaDB/MySQL y ejecutar `database/schema.sql`.

### 3. Crear usuario administrador

```bash
npm run setup-admin
```

### 4. Iniciar servidor

```bash
npm start
```

Verificar funcionamiento:
```
GET /api/health → {"status":"ok","timestamp":"...","service":"RPAD API"}
```

### 5. Sello fundacional (una vez)

Para sellar el estado inicial del sistema en blockchain:

```bash
node scripts/sello-fundacional.js
```

---

## Despliegue en cPanel (WNPower)

### Configurar Node.js App

1. Ir a **Setup Node.js App** en cPanel
2. **Node.js version**: 22.x
3. **Application root**: `rpad`
4. **Application startup file**: `app.js`
5. Agregar variables de entorno en la sección correspondiente
6. Ejecutar `npm install` desde la terminal virtual

### Configurar Cron Jobs

Las notificaciones usan POST (no GET). Configurar en cPanel:

```bash
# Notificaciones diarias (8:00 AM)
0 8 * * * curl -s -X POST -H "x-cron-secret: TU_CRON_SECRET" "https://tu-dominio.com/api/cron/notificaciones" > /dev/null

# Notificar cambios pendientes (9:00 AM)
0 9 * * * curl -s -X POST -H "x-cron-secret: TU_CRON_SECRET" "https://tu-dominio.com/api/cron/cambios-pendientes" > /dev/null
```

---

## Seguridad implementada

| Medida | Detalle |
|--------|---------|
| **Helmet** | Headers de seguridad (CSP, X-Content-Type-Options, etc.) |
| **CSP** | Content Security Policy configurada para CDNs permitidos |
| **Rate limiting** | Login: 10 intentos/15 min. Certificación blockchain: 5 req/min |
| **JWT sin fallback** | Si falta JWT_SECRET, el servidor no arranca |
| **adminOnly** | Middleware de autorización por rol en 22+ rutas de escritura |
| **FOR UPDATE** | Bloqueo de fila en aprobarCambio() para evitar race conditions |
| **Transacciones** | crearCambioPendiente() y aprobarCambio() envueltas en transacciones |
| **Body limit** | express.json limitado a 1MB |
| **Trust proxy** | `app.set('trust proxy', 1)` para IP correcta detrás de proxy |
| **POST para side-effects** | Notificaciones y cron usan POST, no GET |
| **Bcrypt** | Passwords hasheadas con bcryptjs |
| **Token Bearer** | JWT via header Authorization, no via query string |
| **Validación de hash** | Regex `/^0x[0-9a-fA-F]{64}$/` en endpoints blockchain |
| **Nonce serializado** | Cola FIFO de transacciones para evitar colisiones de nonce |
| **Verificación pre-sello** | `getBlockNo()` antes de `put()` para evitar duplicados |

---

## Arquitectura blockchain

```
RPAD (Node.js en WNPower, puerto 3001)
    │
    │ web3.js v4 (HTTP Provider)
    │ URL: http://167.86.71.102:443
    ↓
nginx reverse proxy (VPS Contabo, puerto 443)
    │
    │ proxy_pass → 127.0.0.1:8545
    ↓
Nodo BFA propio (Docker en VPS, puerto 8545 local)
    │
    │ P2P (puerto 30303)
    ↓
Red BFA Producción (Chain ID: 200941592)
    ↓
Contrato TSA2: 0x7e56220069CAaF8367EA42817EA9210296AeC7c6
```

### Flujo de sellado

1. Operador propone cambio → INSERT en `cambios_pendientes`
2. Segundo admin aprueba → se ejecuta cambio en `datasets` + `commit()`
3. Post-commit: se calcula SHA-256 de los datos del cambio → `put([hash])` en TSA2
4. Si hay archivo (tipo 'actualizar'): se sella también el file_hash como registro separado
5. Ambos registros quedan en `blockchain_registros` con estado `pendiente` → `confirmado`

### Qué se sella

| Tipo | Cuándo | Hash |
|------|--------|------|
| `cambio_dataset` | Al aprobar cualquier cambio | SHA-256 del JSON con datos del cambio |
| `certificacion_archivo` | Al actualizar (obligatorio) o crear (opcional) | SHA-256 del archivo calculado en navegador |
| `sello_fundacional` | Una vez al activar blockchain | SHA-256 del estado completo del sistema |

### Qué NO se sella

- Reportes PDF
- Cambios rechazados o pendientes
- Notas administrativas DOCX

---

## Troubleshooting

### Error de conexión a MySQL
- Verificar credenciales en `.env`
- Verificar permisos del usuario MySQL sobre la base de datos

### Error 503 / App no inicia
- Revisar logs en cPanel → Setup Node.js App
- Verificar que `JWT_SECRET` esté configurado (sin él, el servidor no arranca)

### Error SMTP ECONNREFUSED
- El hosting puede bloquear conexiones SMTP salientes
- Solución: usar Gmail con [contraseña de aplicación](https://myaccount.google.com/apppasswords)

### Blockchain: "servicio deshabilitado"
- Verificar que `BFA_RPC_URL` y `BFA_CONTRACT_ADDRESS` estén en `.env`
- Sin estas variables, el módulo se deshabilita silenciosamente

### Blockchain: sellos quedan en "pendiente"
- Verificar que `BFA_KEYFILE_PATH` y `BFA_WALLET_PASSWORD` estén configurados
- Verificar conectividad al nodo BFA: `curl http://IP:443 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`
- Los reintentos automáticos procesan sellos pendientes cada 60 segundos (hasta 10 intentos)

### Token inválido o expirado
- Los tokens JWT expiran en 7 horas
- Cerrar sesión y volver a iniciar

---

## Changelog

### v2.0.0 (2026-02-09)

**Integración con Blockchain Federal Argentina (BFA)**
- Servicio centralizado `blockchainService.js`: conexión a nodo BFA propio, sellado de hashes, verificación, cola de reintentos con backoff.
- Controlador `blockchainController.js`: endpoints públicos de verificación y registro, estado del servicio, certificación voluntaria.
- Sellado automático post-commit en `aprobarCambio()` (hash de operación + hash de archivo).
- Nuevo tipo `tipo_cambio='actualizar'` en `cambios_pendientes` para distinguir de edición de metadatos.
- File hash obligatorio al marcar como actualizado, opcional al crear dataset.
- Tabla `blockchain_registros` con tipos `cambio_dataset`, `certificacion_archivo`, `sello_fundacional`.
- Cola de transacciones serializada (mutex FIFO) para evitar colisiones de nonce.
- Verificación pre-sello (`getBlockNo()`) para evitar duplicados.

**Frontend blockchain**
- `verificar.html`: verificador público con pestañas (por hash / por archivo) + registro paginado de operaciones.
- Card de certificación blockchain en `dataset.html` con header BFA, hashes copiables, QR (qrcode-generator), link a BFA Explorer.
- Drag & drop de archivos en modales "Marcar como actualizado" y "Nuevo Dataset" — hash SHA-256 via Web Crypto API.
- Botón "Certificar archivo" en panel de administración.
- Link "Verificar" agregado en sidebar de todas las páginas.

**Script**
- `scripts/sello-fundacional.js`: sella el estado completo del sistema (una ejecución).

**Seguridad (auditoría blockchain)**
- `adminOnly` aplicado en 22+ rutas de escritura que no lo tenían.
- Autenticación faltante en ruta de notificaciones de cambios pendientes.
- JWT_SECRET sin fallback hardcodeado — fail-fast si falta.
- Rate limiting en endpoint de certificación (5 req/min).
- URL del nodo RPC no se expone en respuestas de API.

**Seguridad (auditoría general)**
- Race condition en `aprobarCambio()` resuelta con `FOR UPDATE` + transacción.
- `crearCambioPendiente()` envuelta en transacción.
- JWT eliminado de URLs de reportes PDF.
- Helmet instalado con CSP configurada para CDNs.
- Body JSON limitado a 1MB.
- Rate limiting en login (10 intentos/15 min).
- Trust proxy configurado para IP correcta.
- Notificaciones y cron cambiados de GET a POST.
- Nodemailer actualizado de 6.10.1 a 8.0.1.
- Rutas reordenadas para evitar colisión de paths paramétricos.

### v1.5.0 (2026-02-06)
- Sistema de doble verificación para cambios en datasets.
- Tabla `cambios_pendientes` con estados pendiente/aprobado/rechazado y validación JSON.
- Endpoints para listar, aprobar y rechazar cambios.
- Artículos gramaticales en tabla `areas`.
- Formulario de contacto público.
- Página de configuración de correos separada.
- Página de perfil de usuario.
- JavaScript compartido entre páginas (`main.js`).

### v1.4.0 (2025-12-10)
- Migración del sistema de formatos a relación Many-to-Many (N:M).
- Generador de notas administrativas DOCX.
- Sistema de roles: `admin` y `lector`.
- Middleware `adminOnly`.
- Calendario interactivo con FullCalendar.js.
- Exportación a iCal (.ics).

### v1.3.0 (2025-12-07)
- Gestión de áreas con CRUD completo.
- Sistema de reportes PDF (4 tipos).
- Tabla `notificaciones_log`.

### v1.2.0 (2025-12-05)
- Integración con API de Andino.
- Sistema de notificaciones por email.
- Endpoint de cron para ejecución automática.

### v1.1.0 (2025-12-04)
- Tablero rediseñado con hero section y gráfico de dona.
- Campo `tipo_gestion` (interna/externa).

### v1.0.0 (2025-11-30)
- Versión inicial: CRUD de datasets, dashboard, autenticación JWT.

---

## Licencia

Uso interno — Municipalidad de Comodoro Rivadavia

## Contacto

**Dirección de Datos Públicos y Comunicación**
Dirección General de Modernización e Investigación Territorial
Municipalidad de Comodoro Rivadavia

datospublicos@comodoro.gov.ar
https://datos.comodoro.gov.ar
