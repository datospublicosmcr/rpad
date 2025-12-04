![RPAD - Registro Permanente de Actualización de Datasets](public/img/logo-2025.png)

# RPAD - Registro Permanente de Actualización de Datasets

Sistema de seguimiento y gestión de actualización de datasets para la Municipalidad de Comodoro Rivadavia.

**Versión actual:** 1.1.0

## Descripción

RPAD permite registrar datasets, asignarles frecuencias de actualización y monitorear su estado. El tablero de seguimiento muestra estadísticas en tiempo real sobre datasets actualizados, próximos a vencer y vencidos, diferenciando entre gestión interna y externa.

## Novedades en v1.1.0

### Tablero de Seguimiento rediseñado
- **Hero section** con gradiente institucional, saludo personalizado según hora del día y nombre del usuario
- **Fecha y hora en vivo** actualizándose en tiempo real
- **Tasa de actualización** calculada correctamente: `(actualizados + próximos) / total`
- **Gráfico de dona animado** con Chart.js mostrando distribución de estados
- **Stat cards clickeables** que llevan directamente al listado filtrado
- **Contadores animados** que incrementan de 0 al valor real
- **Animaciones CSS** de entrada (fade, slide) y efectos hover mejorados

### Diferenciación por tipo de gestión
- **Nuevo campo `tipo_gestion`** en datasets con valores `interna` o `externa`
- **Gestión interna (DGMIT):** Muestra "Atrasado" (badge rojo) cuando vence
- **Gestión externa (otras áreas):** Muestra "Sin respuesta" (badge naranja) cuando vence
- **Filtro "Vencidos"** que agrupa ambos estados
- **Filtros específicos** para "Atrasado" y "Sin respuesta" por separado

### Mejoras en la interfaz
- Borde superior de color en stat cards (en lugar de lateral)
- Leyenda personalizada en gráfico de dona con porcentajes
- Botones "Ver más / Ver menos" en listas de alertas
- Campo tipo de gestión obligatorio en formulario de administración
- Exportación CSV incluye columna "Tipo Gestión"

## Tecnologías

- **Backend**: Node.js + Express (JavaScript ES Modules)
- **Frontend**: HTML5, CSS3, JavaScript vanilla (servido por Express)
- **Base de datos**: MySQL/MariaDB
- **Autenticación**: JWT
- **Gráficos**: Chart.js (via CDN)

## Estructura del proyecto

```
rpad/
├── app.js                    # Entry point - Express server
├── package.json
├── .env                      # Variables de entorno (no incluido en repo)
├── .env.example              # Template de variables
├── .gitignore
├── config/
│   └── database.js           # Pool de conexiones MySQL
├── controllers/
│   ├── authController.js     # Login, verificación, cambio password
│   ├── catalogController.js  # Temas, frecuencias, formatos
│   └── datasetController.js  # CRUD datasets, estadísticas
├── database/
│   └── schema.sql            # Estructura y datos iniciales de la BD
├── middleware/
│   └── auth.js               # JWT middleware
├── routes/
│   └── index.js              # Definición de rutas API
├── scripts/
│   └── setup-admin.js        # Script para crear usuario admin
└── public/                   # Frontend (servido por Express)
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

Esto creará las tablas y cargará los datos iniciales (temas, frecuencias y algunos datasets de ejemplo).

### Estructura de tablas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Administradores del sistema |
| `temas` | Catálogo de temas para clasificación |
| `frecuencias` | Catálogo de frecuencias de actualización |
| `datasets` | Registro principal de datasets |
| `historial_actualizaciones` | Log de actualizaciones realizadas |

### Migración de v1.0.0 a v1.1.0

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

Editar `.env` con los datos de tu servidor:
```
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos
JWT_SECRET=una_clave_secreta_larga
PORT=3001
CORS_ORIGIN=https://tu-dominio.com
```

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

En la sección **Environment variables** de la app (**Setup Node.js App**), agregar cada variable del `.env`.

### 6. Crear usuario administrador

```bash
npm run setup-admin
```

Seguir las instrucciones interactivas.

### 7. Iniciar la aplicación

Click en **Restart** en el panel de Node.js App.

### 8. Verificar funcionamiento

Acceder a:
```
https://tu-dominio.com/api/health
```

Respuesta esperada:
```json
{"status":"ok","timestamp":"...","service":"RPAD API"}
```

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

### Protegidos (requieren JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/verify` | Verificar sesión activa |
| POST | `/api/auth/change-password` | Cambiar contraseña |
| POST | `/api/datasets` | Crear dataset |
| PUT | `/api/datasets/:id` | Actualizar dataset |
| DELETE | `/api/datasets/:id` | Eliminar dataset (soft delete) |
| POST | `/api/datasets/:id/actualizar` | Registrar actualización |

## Filtros disponibles en `/api/datasets`

- `?tema=ID` - Filtrar por tema
- `?frecuencia=ID` - Filtrar por frecuencia
- `?estado=actualizado|proximo|atrasado|sin-respuesta` - Filtrar por estado
- `?busqueda=texto` - Buscar en título y descripción

## Estadísticas (`/api/datasets/estadisticas`)

Respuesta incluye:
- `total` - Total de datasets activos
- `actualizados` - Datasets al día
- `proximos` - Datasets que vencen en 60 días o menos
- `atrasados` - Vencidos de gestión interna
- `sinRespuesta` - Vencidos de gestión externa
- `totalVencidos` - Suma de atrasados + sinRespuesta
- `tasaActualizacion` - Porcentaje de datasets no vencidos
- `promedioAtraso` - Promedio de días de atraso
- `porTema` - Distribución por tema
- `porFrecuencia` - Distribución por frecuencia

## Troubleshooting

### Error de conexión a MySQL
- Verificar credenciales en `.env`
- Verificar que el usuario MySQL tiene permisos sobre la base de datos
- Comprobar que la base de datos existe

### Error 503 / App no inicia
- Revisar logs en cPanel → Setup Node.js App → Logs
- Verificar que `app.js` existe y está configurado como startup file
- Comprobar que las variables de entorno están configuradas

### Error de módulos no encontrados
- Ejecutar `npm install` desde la terminal virtual de la app

### Token inválido o expirado
- Cerrar sesión y volver a iniciar
- Verificar que JWT_SECRET está configurado correctamente

### Frontend no carga estilos/scripts
- Verificar permisos de carpeta `public/` (755)
- Verificar permisos de archivos dentro de `public/` (644)

### Gráfico de dona no aparece
- Verificar conexión a internet (Chart.js se carga via CDN)
- Comprobar en consola del navegador que no hay errores de red

## Changelog

### v1.1.0 (2025-12-04)
- Tablero de seguimiento rediseñado con hero section y gráfico de dona
- Campo `tipo_gestion` para diferenciar datasets internos/externos
- Estados "Atrasado" y "Sin respuesta" según tipo de gestión
- Stat cards clickeables con animaciones
- Tasa de actualización corregida
- Filtro "Vencidos" que agrupa ambos estados

### v1.0.0 (2025-11-30)
- Versión inicial
- CRUD de datasets
- Dashboard con estadísticas
- Autenticación JWT
- Panel de administración

## Licencia

Uso interno - Municipalidad de Comodoro Rivadavia

## Contacto

**Dirección de Datos Públicos y Comunicación**  
Dirección General de Modernización e Investigación Territorial  
Municipalidad de Comodoro Rivadavia

📧 datospublicos@comodoro.gov.ar  
🌐 https://datos.comodoro.gov.ar
