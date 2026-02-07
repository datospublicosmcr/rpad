# Auditoría General de Seguridad — RPAD v1.5/1.6
## 7 de febrero de 2026

**Alcance:** Todo el sistema RPAD excepto el módulo blockchain (auditado por separado).
**Archivos revisados:** 30+ archivos entre controllers, middleware, config, routes y frontend JS.

---

## Resumen ejecutivo

| Severidad | Cantidad |
|-----------|----------|
| CRITICO   | 3        |
| MEDIO     | 15       |
| BAJO      | 12       |
| **Total** | **30**   |

---

## CRITICOS

### C1. Race condition en aprobarCambio() — TOCTOU sin FOR UPDATE

**Archivo:** `controllers/cambiosPendientesController.js:365-400`
**Descripción:** `aprobarCambio()` hace un SELECT para verificar que el cambio está en estado `pendiente` (línea 372-374), pero **sin `FOR UPDATE`** y **antes de `beginTransaction()`** (línea 400). Si dos admins aprueban el mismo cambio simultáneamente, ambos leen `estado='pendiente'`, ambos ejecutan el cambio (duplicando un INSERT para `crear`, o aplicando doble UPDATE), y ambos sellan en blockchain.

**Fix sugerido:** Mover `beginTransaction()` antes del SELECT y agregar `FOR UPDATE`:
```sql
SELECT * FROM cambios_pendientes WHERE id = ? AND estado = 'pendiente' FOR UPDATE
```

---

### C2. Race condition en crearCambioPendiente() — DELETE + INSERT sin transacción

**Archivo:** `controllers/cambiosPendientesController.js:636-658`
**Descripción:** `crearCambioPendiente()` hace DELETE de cambios pendientes previos (línea 639-642) y luego INSERT del nuevo (línea 645-655) **sin transacción**. Si el DELETE tiene éxito pero el INSERT falla, el cambio pendiente anterior se pierde sin reemplazo. Además, dos requests simultáneos pueden causar inconsistencias.

**Fix sugerido:** Envolver DELETE + INSERT en una transacción, o recibir la `connection` del caller.

---

### C3. JWT token filtrado en URLs de reportes PDF

**Archivo:** `public/js/api.js:296-317`
**Descripción:** Las funciones `getReporteEstadoGeneralUrl()`, `getReporteHistorialUrl()`, `getReportePorAreaUrl()`, y `getReporteCumplimientoUrl()` insertan el JWT como `?token=<jwt>` en la URL. Aunque el backend no usa ese parámetro (authMiddleware solo verifica el header Authorization), el token queda expuesto en:
- Historial del navegador
- Logs de acceso del servidor/proxy
- Headers Referer si el usuario navega desde esa página
- Cache de intermediarios

El `?token=` es código muerto peligroso — `descargarPDF()` en `reportes.js:101-104` ya envía el token correctamente vía `Auth.getAuthHeaders()`.

**Fix sugerido:** Eliminar `?token=${token}` de las 4 funciones URL builders. La auth ya funciona por headers.

---

## MEDIO

### M1. Sin headers de seguridad (helmet)

**Archivo:** `app.js`
**Descripción:** No se usa `helmet` ni se configuran headers de seguridad. Faltan: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`.

**Fix sugerido:** `npm install helmet` y agregar `app.use(helmet())` en app.js.

---

### M2. Sin límite de tamaño en body JSON

**Archivo:** `app.js:25`
**Descripción:** `express.json()` se usa sin límite de tamaño. Un atacante puede enviar payloads JSON de cientos de MB, causando DoS por consumo de memoria.

**Fix sugerido:** `app.use(express.json({ limit: '1mb' }))`.

---

### M3. Sin protección de fuerza bruta en login

**Archivo:** `controllers/authController.js:6-69`, `routes/index.js:73`
**Descripción:** `POST /auth/login` no tiene rate limiting. Un atacante puede intentar combinaciones ilimitadas de usuario/contraseña. El contacto tiene rate limiting propio y blockchain usa `express-rate-limit`, pero login está desprotegido.

**Fix sugerido:** Agregar `express-rate-limit` al login (ej: max 10 intentos por 15 min por IP). Opcionalmente, lockout temporal de cuenta después de N fallos.

---

### M4. Política de contraseña débil

**Archivo:** `controllers/authController.js:111-116`
**Descripción:** Solo se valida `newPassword.length < 8`. No se exige mayúscula, minúscula, número ni carácter especial. Para un sistema de gobierno con certificación blockchain, es insuficiente.

**Fix sugerido:** Agregar regex de complejidad: al menos 1 mayúscula, 1 minúscula, 1 dígito, 1 especial. Validar que la nueva contraseña sea diferente a la actual.

---

### M5. Trust proxy no configurado — IP spoofeable

**Archivo:** `app.js`, `controllers/contactoController.js:60-66`
**Descripción:** Express no tiene `trust proxy` configurado, pero `contactoController.js` lee `x-forwarded-for` y `x-real-ip` manualmente para rate limiting. Un atacante puede enviar headers falsos para bypassear el rate limit enviando IPs diferentes en cada request. Además, `express-rate-limit` (blockchain) también se ve afectado.

**Fix sugerido:** Agregar `app.set('trust proxy', 1)` en app.js (asumiendo un proxy). Usar `req.ip` (que respeta `trust proxy`) en vez de parsear headers manualmente.

---

### M6. XSS via innerHTML en main.js (header de usuario)

**Archivo:** `public/js/main.js:114-132`
**Descripción:** La variable `nombre` (de `Auth.getUser().nombre_completo`) se inserta en `innerHTML` sin escapar. Si `nombre_completo` contiene HTML, se renderiza. El valor viene de localStorage que puede ser manipulado, o del backend si un admin malicioso cambia su nombre.

**Fix sugerido:** Aplicar `Utils.escapeHtml(nombre)` antes de insertar en innerHTML.

---

### M7. XSS via innerHTML en showToast()

**Archivo:** `public/js/main.js:259-262`
**Descripción:** El parámetro `message` se inserta en `innerHTML` sin escapar. Callers como `correos.js:41` pasan `errorMsg` de respuestas API. Si el backend retorna un error con HTML/script, se ejecuta en el navegador.

**Fix sugerido:** Usar `textContent` para el span, o escapar `message`.

---

### M8. XSS via innerHTML en contacto.js

**Archivo:** `public/js/contacto.js:34-39`
**Descripción:** El parámetro `texto` se inserta en `innerHTML`. En líneas 99 y 104, se pasa `result.message` y `result.error` del servidor directamente.

**Fix sugerido:** Escapar `texto` con `escapeHtml()`.

---

### M9. XSS via innerHTML en correos.js

**Archivo:** `public/js/correos.js:41-48`
**Descripción:** `errorMsg` y `errorCode` de respuestas API se concatenan directamente en `innerHTML`.

**Fix sugerido:** Escapar ambos valores.

---

### M10. document.write() con HTML de API en correos.js

**Archivo:** `public/js/correos.js:73-74`
**Descripción:** `API.previewNotificacion(tipo)` devuelve HTML raw que se escribe con `document.write()` en una ventana nueva. Si la respuesta contiene JavaScript malicioso (MITM, backend comprometido), se ejecuta.

**Fix sugerido:** Usar iframe con `srcdoc` y atributo `sandbox` para aislar la ejecución.

---

### M11. Notificaciones usan GET para operaciones con efectos secundarios

**Archivo:** `routes/index.js:144-145, 148, 167-181`
**Descripción:** `ejecutarNotificacionesDiarias` y `ejecutarNotificacionCambiosPendientes` están mapeadas a GET. Enviar emails es una operación con side-effects. GET puede ser disparado por prefetch del navegador, crawlers, o cached por proxies.

**Fix sugerido:** Cambiar a POST.

---

### M12. Error messages exponen detalles internos

**Archivos:** `controllers/reportesController.js:310,551,785,891`, `controllers/notificacionesController.js:356,462,591,710`
**Descripción:** Estos controllers devuelven `error.message` al cliente, pudiendo exponer estructura de BD, paths de archivos, o errores de librerías.

**Fix sugerido:** Devolver mensaje genérico al cliente y logear `error.message` solo en servidor.

---

### M13. Vulnerabilidad en nodemailer (npm audit)

**Paquete:** `nodemailer <=7.0.10`
**Severidad:** Moderate (según npm advisory)
**Descripción:** Dos vulnerabilidades conocidas:
- GHSA-mm7p-fcc7-pg87: Email a dominio no intencionado por conflicto de interpretación
- GHSA-rcmh-qjqh-p98v: DoS por llamadas recursivas en addressparser

**Fix sugerido:** `npm install nodemailer@latest` (v8.x es breaking change, requiere testing).

---

### M14. Bug de routing: verificarDatasetBloqueado inalcanzable

**Archivo:** `routes/index.js:130-131`
**Descripción:** `GET /cambios-pendientes/:id` (línea 130) se define **antes** de `GET /cambios-pendientes/verificar/:datasetId` (línea 131). Express matchea en orden, así que `/cambios-pendientes/verificar/5` matchea `/:id` con `id='verificar'` en vez de la ruta correcta.

**Fix sugerido:** Mover `verificar/:datasetId` antes de `/:id`, o renombrar la ruta.

---

### M15. Endpoints cron — sin fail-safe y secret expuesto en query string

**Archivo:** `routes/index.js:167-181`
**Descripción:** `CRON_SECRET` **sí está configurado en producción**, por lo que los endpoints cron están protegidos. Sin embargo, quedan dos debilidades en el código:
1. **Sin fail-safe:** Si `CRON_SECRET` se borra accidentalmente del `.env`, `undefined !== undefined` es `false` y los endpoints quedan completamente abiertos sin ningún error visible. El código no valida que la variable exista.
2. **Secret en query string:** `req.query.secret` expone el secreto en logs de acceso del servidor/proxy (access logs registran la URL completa con parámetros).

**Nota:** Este hallazgo fue inicialmente reportado como CRITICO asumiendo que `CRON_SECRET` no estaba configurado. Se reclasifica a MEDIO tras confirmar que la variable existe en el `.env` de producción.

**Fix sugerido:**
1. Agregar validación fail-safe: `if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET)`
2. Eliminar `req.query.secret` y solo aceptar el header `x-cron-secret`

---

## BAJO

### B1. JWT con expiración generosa (7 horas)

**Archivo:** `middleware/auth.js:7`
**Descripción:** `expiresIn: '7h'`. Para un sistema admin de gobierno, es un window largo. No hay mecanismo de revocación de tokens (blacklist).

**Fix sugerido:** Considerar reducir a 2h con refresh token. Agregar token version per-user para revocación.

---

### B2. Sin validación de formato de email en updateProfile

**Archivo:** `controllers/authController.js:192-203`
**Descripción:** Se verifica unicidad del email pero no formato. Un usuario podría setear un email inválido.

**Fix sugerido:** Agregar regex de validación de email.

---

### B3. Sin validación de largo en nombre_completo en updateProfile

**Archivo:** `controllers/authController.js:210-212`
**Descripción:** `nombre_completo` se trimea pero no se valida largo. Valores excesivamente largos pueden causar errores de BD.

**Fix sugerido:** Validar largo máximo (ej: 255 chars).

---

### B4. Áreas usan hard delete en vez de soft delete

**Archivo:** `controllers/areasController.js:222-225`
**Descripción:** `deleteArea()` hace `DELETE FROM areas WHERE id = ?`, a diferencia de datasets que usan `activo = FALSE`. Inconsistente y no recuperable. Si un área tiene datasets soft-deleted, quedan huérfanos.

**Fix sugerido:** Usar soft delete (agregar columna `activo`).

---

### B5. pool.query() vs pool.execute() inconsistente en notasController

**Archivo:** `controllers/notasController.js:129, 137`
**Descripción:** Usa `pool.query()` en vez de `pool.execute()`. El `pool.query('... WHERE d.id IN (?)', [datasetIds])` pasa un array como placeholder único. Funciona con `query()` (expande arrays) pero no con `execute()`. Inconsistente con el resto del codebase.

**Fix sugerido:** Usar `pool.execute()` con placeholders explícitos: `datasetIds.map(() => '?').join(',')`.

---

### B6. Sin paginación en listados principales

**Archivos:** `controllers/datasetController.js:146`, `controllers/cambiosPendientesController.js:190,238`
**Descripción:** `getDatasets()`, `getCambiosPendientesParaRevisar()`, y `getMisCambios()` devuelven todos los registros sin LIMIT. Con 78 datasets actuales no es problema, pero escala mal.

**Fix sugerido:** Agregar parámetros `page` y `limit` con defaults razonables (ej: 50).

---

### B7. formatoIds no validados como enteros

**Archivo:** `controllers/datasetController.js:241, 346`
**Descripción:** `data.formatos.map(f => typeof f === 'object' ? f.id : f)` no valida que sean enteros positivos. Valores no numéricos causan errores de BD poco informativos.

**Fix sugerido:** Validar: `formatoIds.every(id => Number.isInteger(Number(id)) && Number(id) > 0)`.

---

### B8. Missing try/catch en verificarSMTP

**Archivo:** `controllers/notificacionesController.js:470-478`
**Descripción:** `verificarSMTP` no tiene try/catch. Si `verifyConnection()` lanza un error inesperado, el request cuelga o crashea con unhandled rejection.

**Fix sugerido:** Envolver en try/catch.

---

### B9. XSS potencial en openDeleteModal via inyección en título

**Archivos:** `public/js/admin.js:418`, `public/js/areas.js:84`
**Descripción:** Los títulos se escapan con `escapeHtml()` y luego se ponen en un string JS dentro de `onclick`: `onclick="openDeleteModal(${d.id}, '${Utils.escapeHtml(d.titulo).replace(/'/g, "\\'")}')"`. El escape no maneja backslashes: un título con `\'` podría escapar la comilla.

**Fix sugerido:** Usar `data-*` attributes y event listeners en vez de onclick inline.

---

### B10. Object URL memory leak en CSV export

**Archivo:** `public/js/datasets.js:245-247`
**Descripción:** Se crea blob URL para exportar CSV pero nunca se llama `URL.revokeObjectURL()`. En contraste, `reportes.js:122` y `calendario.js:367` sí lo hacen.

**Fix sugerido:** Agregar `URL.revokeObjectURL(link.href)` después de `link.click()`.

---

### B11. console.error en producción

**Archivos:** Múltiples (admin.js, datasets.js, areas.js, perfil.js, main.js, dashboard.js, contacto.js, notas.js)
**Descripción:** `console.error()` se usa extensivamente para logear errores. En producción expone paths de API, detalles de errores y stack traces a quien abra la consola del navegador.

**Fix sugerido:** Wrapper de logging que se desactive en producción.

---

### B12. Sin timeout en fetch() del frontend

**Archivo:** `public/js/api.js` (todos los fetch)
**Descripción:** Ningún `fetch()` usa `AbortController` ni timeout. Si el servidor no responde, la UI cuelga indefinidamente.

**Fix sugerido:** Wrapper de fetch con `AbortController` y timeout de 30s.

---

## Observaciones positivas (no son hallazgos)

- **SQL injection:** Todas las queries usan placeholders parametrizados (`?`). Las queries dinámicas (`${campo} = ?`) usan whitelists hardcodeadas de nombres de columna. No se encontró SQL injection.
- **Contraseñas:** Se hashean con bcrypt (salt rounds = 10) correctamente.
- **Auto-aprobación prevenida:** `aprobarCambio()` y `rechazarCambio()` verifican que el revisor no sea el que propuso el cambio.
- **Errores genéricos al cliente:** La mayoría de controllers devuelven "Error interno del servidor" (excepto reportes y notificaciones — ver M12).
- **escapeHtml() existe y se usa:** La mayoría de inserciones en innerHTML usan `Utils.escapeHtml()`. Los hallazgos de XSS son en los puntos donde NO se usa.
- **Soft delete en datasets:** Preserva integridad referencial.
- **Rate limiting en contacto:** Implementado (aunque en memoria — aceptable para single-instance).
- **CORS configurado:** Origin restringido al dominio de producción.
- **No hay secrets hardcodeados** en código (post-fix S3 del JWT).

---

## Priorización recomendada

### Inmediato (antes de deploy a producción):
1. **C1** — FOR UPDATE + mover beginTransaction en aprobarCambio()
2. **C3** — Eliminar `?token=` de URLs de reportes
3. **M1** — Instalar helmet
4. **M2** — Limitar body size
5. **M3** — Rate limiting en login
6. **M14** — Reordenar rutas de cambios-pendientes

### Corto plazo (primera semana post-deploy):
7. **C2** — Transacción en crearCambioPendiente()
8. **M5** — Configurar trust proxy
9. **M6-M10** — Fixes de XSS en frontend (escapeHtml en showToast, contacto, correos, main)
10. **M11** — Cambiar notificaciones de GET a POST
11. **M12** — Generar mensajes de error genéricos en reportes/notificaciones
12. **M13** — Actualizar nodemailer
13. **M15** — Fail-safe en CRON_SECRET y mover secret a header

### Mejoras graduales:
14. **M4** — Política de contraseñas
15. **B1-B12** — Issues de bajo impacto
