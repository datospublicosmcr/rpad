![RPAD - Registro Permanente de Actualización de Datasets](public/img/logo-2025.png)

# RPAD - Registro Permanente de Actualización de Datasets

Sistema de seguimiento y gestión de actualización de datasets para la Municipalidad de Comodoro Rivadavia.

**Versión actual:** 1.2.0

## Descripción

RPAD permite registrar datasets, asignarles frecuencias de actualización y monitorear su estado. El tablero de seguimiento muestra estadísticas en tiempo real sobre datasets actualizados, próximos a vencer y vencidos, diferenciando entre gestión interna y externa.

## Novedades en v1.2.0

### Integración con Portal de Datos Abiertos (Andino)
- **Importación automática** de metadatos desde datos.comodoro.gov.ar
- **Flujo de 2 pasos** para crear datasets: primero importar desde el portal, luego completar datos adicionales
- **Botón "Actualizar desde portal"** en edición para sincronizar título, descripción y área responsable
- **Vinculación directa** con el dataset en el portal mediante URL

### Sistema de Notificaciones por Email
- **Alertas automáticas** según tipo de gestión y días restantes hasta vencimiento
- **Panel de notificaciones** en administración para verificar SMTP, previsualizar y enviar emails de prueba
- **Cron job** para ejecución automática diaria a las 8:00 AM
- **Plantillas HTML** con diseño institucional para cada tipo de alerta

#### Calendario de alertas

**Gestión Interna (DGMIT):**
| Días | Alerta | Acción |
|------|--------|--------|
| -60 | Planificación | Iniciar planificación |
| -30 | Vencimiento próximo | Priorizar procesamiento |
| Día 1° | Resumen mensual | Regularizar vencidos |

**Gestión Externa (otras áreas):**
| Días | Alerta | Acción |
|------|--------|--------|
| -60 | Redacción de notas | Redactar solicitudes formales |
| -40 | Distribución | Distribuir pedidos a las áreas |
| -5 | Último aviso | Contacto telefónico/email |
| Día 1° | Resumen mensual | Reclamo/reiteración |

### Mejoras anteriores (v1.1.0)
- **Tablero rediseñado** con hero section, gráfico de dona animado y stat cards clickeables
- **Campo `tipo_gestion`** para diferenciar datasets internos/externos
- **Estados diferenciados:** "Atrasado" (interno) y "Sin respuesta" (externo)

## Tecnologías

- **Backend**: Node.js + Express (JavaScript ES Modules)
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Base de datos**: MySQL/MariaDB
- **Autenticación**: JWT
- **Gráficos**: Chart.js (via CDN)
- **Email**: Nodemailer

## Estructura del proyecto

```
rpad/
├── app.js                    # Entry point - Express server
├── package.json
├── .env                      # Variables de entorno (no incluido en repo)
├── .env.example              # Template de variables
├── config/
│   └── database.js           # Pool de conexiones MySQL
├── controllers/
│   ├── authController.js     # Login, verificación, cambio password
│   ├── catalogController.js  # Temas, frecuencias, formatos
│   ├── datasetController.js  # CRUD datasets, estadísticas
│   ├── andinoController.js   # Integración con portal de datos
│   └── notificacionesController.js  # Sistema de alertas por email
├── services/
│   ├── emailService.js       # Configuración SMTP y envío
│   └── emailTemplates.js     # Plantillas HTML para emails
├── database/
│   └── schema.sql            # Estructura y datos iniciales de la BD
├── middleware/
│   └── auth.js               # JWT middleware
├── routes/
│   └── index.js              # Definición de rutas API
├── scripts/
│   └── setup-admin.js        # Script para crear usuario admin
└── public/                   # Frontend
    ├── index.html            # Tablero de seguimiento
    ├── datasets.html         # Listado de datasets
    ├── dataset.html          # Detalle de dataset
    ├── login.html            # Formulario de login
    ├── admin.html            # Panel de administración
    ├── css/
    │   └── styles.css
    ├── js/
    │   ├── config.js         # Configuración (API_URL)
    │   ├── auth.js           # Manejo de autenticación
    │   ├── api.js            # Llamadas a la API y utilidades
    │   ├── dashboard.js      # Lógica del tablero
    │   ├── datasets.js       # Listado de datasets
    │   ├── dataset-detail.js # Detalle de dataset
    │   └── admin.js          # Panel de administración
    └── img/
        ├── icon.png
        ├── logo-2025.png
        └── logo-2025-blanco.png
```

## Base de datos

### Crear la base de datos

1. En cPanel ir a **MySQL Databases**
2. Crear una nueva base de datos (ej: `usuario_rpad`)
3. Crear un usuario MySQL y asignarle todos los permisos sobre esa base

### Ejecutar el schema

Desde **phpMyAdmin** en cPanel:

1. Seleccionar la base de datos creada
2. Ir a la pestaña **Importar**
3. Subir el archivo `database/schema.sql`
4. Click en **Ejecutar**

### Estructura de tablas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Administradores del sistema |
| `temas` | Catálogo de temas para clasificación |
| `frecuencias` | Catálogo de frecuencias de actualización |
| `datasets` | Registro principal de datasets |
| `historial_actualizaciones` | Log de actualizaciones realizadas |

### Migración desde v1.0.0

Si ya tenés la versión 1.0.0 instalada, ejecutar en phpMyAdmin:

```sql
ALTER TABLE `datasets` 
ADD COLUMN `tipo_gestion` ENUM('interna', 'externa') NOT NULL DEFAULT 'externa'
AFTER `observaciones`;
```

---

## Instalación en cPanel

### 1. Subir archivos

Subir la carpeta `rpad/` al directorio home:
```
/home/TU_USUARIO/rpad/
```

> ⚠️ **NO en public_html**. Debe estar en el directorio home del usuario.

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y completar:
```bash
cp .env.example .env
```

Editar `.env`:
```
# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos

# Seguridad
JWT_SECRET=una_clave_secreta_larga
CRON_SECRET=clave_para_cron_job

# Servidor
PORT=3001
CORS_ORIGIN=https://tu-dominio.com

# SMTP (para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_cuenta@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
```

> **Nota sobre SMTP:** Si el hosting bloquea conexiones SMTP salientes (error ECONNREFUSED), usar Gmail con [contraseña de aplicación](https://myaccount.google.com/apppasswords).

### 3. Configurar Node.js App en cPanel

1. Ir a **Setup Node.js App**
2. Click en **Create Application**
3. Configurar:
   - **Node.js version**: 22.x (o la más reciente disponible)
   - **Application mode**: Production
   - **Application root**: `rpad`
   - **Application URL**: Seleccionar dominio/subdominio
   - **Application startup file**: `app.js`
4. Click **Create**

### 4. Instalar dependencias

Desde la terminal virtual de la app en cPanel:
```bash
npm install
```

### 5. Configurar variables de entorno en cPanel

En la sección **Environment variables** de la app, agregar cada variable del `.env`.

### 6. Crear usuario administrador

```bash
npm run setup-admin
```

### 7. Iniciar la aplicación

Click en **Restart** en el panel de Node.js App.

### 8. Verificar funcionamiento

```
https://tu-dominio.com/api/health
```

Respuesta esperada:
```json
{"status":"ok","timestamp":"...","service":"RPAD API"}
```

---

## Configurar Cron Job (Notificaciones automáticas)

### 1. Verificar que funciona manualmente

```
https://tu-dominio.com/api/cron/notificaciones?secret=TU_CRON_SECRET
```

### 2. Configurar en cPanel → Cron Jobs

| Campo | Valor |
|-------|-------|
| Minuto | 0 |
| Hora | 8 |
| Día | * |
| Mes | * |
| Día semana | * |
| Comando | `curl -s "https://tu-dominio.com/api/cron/notificaciones?secret=TU_CRON_SECRET" > /dev/null` |

Esto ejecuta las notificaciones todos los días a las 8:00 AM.

---

## API Endpoints

### Públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/datasets` | Listar datasets (con filtros) |
| GET | `/api/datasets/estadisticas` | Estadísticas para tablero |
| GET | `/api/datasets/:id` | Detalle de un dataset |
| GET | `/api/catalogos/temas` | Listar temas |
| GET | `/api/catalogos/frecuencias` | Listar frecuencias |
| GET | `/api/catalogos/formatos` | Listar formatos disponibles |
| GET | `/api/andino/fetch?url=...` | Obtener metadatos desde el portal |

### Protegidos (requieren JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/verify` | Verificar sesión activa |
| POST | `/api/auth/change-password` | Cambiar contraseña |
| POST | `/api/datasets` | Crear dataset |
| PUT | `/api/datasets/:id` | Actualizar dataset |
| DELETE | `/api/datasets/:id` | Eliminar dataset (soft delete) |
| POST | `/api/datasets/:id/actualizar` | Registrar actualización |
| GET | `/api/notificaciones/ejecutar` | Ejecutar proceso de notificaciones |
| GET | `/api/notificaciones/prueba/:tipo` | Enviar email de prueba |
| GET | `/api/notificaciones/verificar-smtp` | Verificar conexión SMTP |
| GET | `/api/notificaciones/preview/:tipo` | Previsualizar email |

### Cron (requiere secret)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/cron/notificaciones?secret=...` | Ejecutar notificaciones (para cron) |

### Filtros disponibles en `/api/datasets`

- `?tema=ID` - Filtrar por tema
- `?frecuencia=ID` - Filtrar por frecuencia
- `?estado=actualizado|proximo|atrasado|sin-respuesta` - Filtrar por estado
- `?busqueda=texto` - Buscar en título y descripción

---

## Troubleshooting

### Error de conexión a MySQL
- Verificar credenciales en `.env`
- Verificar que el usuario MySQL tiene permisos sobre la base de datos

### Error 503 / App no inicia
- Revisar logs en cPanel → Setup Node.js App
- Verificar que `app.js` existe y está configurado como startup file

### Error SMTP ECONNREFUSED
- El hosting bloquea conexiones SMTP salientes
- Solución: Usar Gmail con contraseña de aplicación

### Token inválido o expirado
- Cerrar sesión y volver a iniciar

### Notificaciones no se envían
- Verificar conexión SMTP desde panel Admin
- Revisar que CRON_SECRET coincide en `.env` y cron job

---

## Changelog

### v1.2.0 (2025-12-05)
- Integración con API de Andino (portal de datos abiertos)
- Flujo de 2 pasos para crear datasets con importación automática
- Botón "Actualizar desde portal" en edición
- Sistema de notificaciones por email
- Alertas automáticas según tipo de gestión y días restantes
- Panel de notificaciones en administración
- Endpoint de cron para ejecución automática
- Plantillas HTML institucionales para emails

### v1.1.0 (2025-12-04)
- Tablero de seguimiento rediseñado con hero section y gráfico de dona
- Campo `tipo_gestion` para diferenciar datasets internos/externos
- Estados "Atrasado" y "Sin respuesta" según tipo de gestión
- Stat cards clickeables con animaciones

### v1.0.0 (2025-11-30)
- Versión inicial
- CRUD de datasets
- Dashboard con estadísticas
- Autenticación JWT
- Panel de administración

---

## Licencia

Uso interno - Municipalidad de Comodoro Rivadavia

## Contacto

**Dirección de Datos Públicos y Comunicación**  
Dirección General de Modernización e Investigación Territorial  
Municipalidad de Comodoro Rivadavia

📧 datospublicos@comodoro.gov.ar  
🌐 https://datos.comodoro.gov.ar
