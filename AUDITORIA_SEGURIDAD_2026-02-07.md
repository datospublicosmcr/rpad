# Auditoría de Seguridad y Bugs — Módulo Blockchain RPAD

**Fecha:** 2026-02-07
**Alcance:** Módulo blockchain (controller, service, rutas, middleware, frontend)
**Archivos revisados:**
- `controllers/blockchainController.js`
- `services/blockchainService.js`
- `routes/index.js`
- `middleware/auth.js`
- `controllers/cambiosPendientesController.js`
- `public/js/admin.js`
- `public/js/dataset-detail.js`
- `public/js/api.js`
- `public/js/auth.js`
- `public/verificar.html`

---

## SEGURIDAD

### 🔴 CRÍTICO — S1: `adminOnly` existe pero nunca se usa en ninguna ruta

**Archivo:** `routes/index.js` (todas las rutas protegidas) + `middleware/auth.js:43`

El middleware `adminOnly` está definido y exportado en `middleware/auth.js:43-51`, pero **nunca se importa ni aplica** en `routes/index.js`. La línea 2 solo importa `authMiddleware`:

```js
import { authMiddleware } from '../middleware/auth.js';  // falta adminOnly
```

**Impacto:** Cualquier usuario autenticado (incluyendo rol "lector") puede, usando la API directamente:
- `POST /cambios-pendientes/:id/aprobar` — aprobar cambios de otros usuarios
- `POST /cambios-pendientes/:id/rechazar` — rechazar cambios
- `POST /blockchain/certificar` — sellar en blockchain (gasta gas)
- `GET /blockchain/estado` — ver estado interno del nodo
- Todas las rutas de notificaciones, reportes, notas

La verificación `Auth.isAdmin()` en el frontend (`admin.js:183`) es solo cosmética y trivialmente bypasseable.

**Fix:** En `routes/index.js`, importar `adminOnly` y agregarlo como segundo middleware en las rutas de escritura:
```js
import { authMiddleware, adminOnly } from '../middleware/auth.js';
router.post('/cambios-pendientes/:id/aprobar', authMiddleware, adminOnly, aprobarCambio);
router.post('/blockchain/certificar', authMiddleware, adminOnly, certificarArchivo);
// etc.
```

---

### 🔴 CRÍTICO — S2: Ruta de notificaciones sin autenticación

**Archivo:** `routes/index.js:140`

```js
router.get('/notificaciones/cambios-pendientes', ejecutarNotificacionCambiosPendientes);
```

Esta ruta **no tiene `authMiddleware`** ni protección por cron secret. Cualquier persona puede disparar envío de emails golpeando este endpoint.

**Fix:** Agregar `authMiddleware, adminOnly` o proteger con cron secret como las demás rutas cron.

---

### 🔴 CRÍTICO — S3: JWT secret con fallback hardcodeado débil

**Archivo:** `middleware/auth.js:4`

```js
const JWT_SECRET = process.env.JWT_SECRET || 'rpad-secret-key-cambiar-en-produccion';
```

Si `JWT_SECRET` no está configurado en `.env`, cualquiera puede forjar tokens JWT válidos con ese secret predecible.

**Fix:** Fallar al iniciar si `JWT_SECRET` no está definido:
```js
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET no configurado');
```

---

### 🟡 MEDIO — S4: Sin rate limiting en POST /blockchain/certificar

**Archivo:** `routes/index.js:131`, `blockchainController.js:190`

No hay rate limiting en el endpoint de certificación. Un usuario autenticado (o atacante con token robado) puede enviar miles de requests, gastando todo el balance de la wallet municipal.

**Fix:** Agregar `express-rate-limit` para endpoints de escritura blockchain (ej: 5 requests/minuto por usuario).

---

### 🟡 MEDIO — S5: getEstado expone URL interna del nodo RPC

**Archivo:** `services/blockchainService.js:348`

```js
rpcUrl: process.env.BFA_RPC_URL || null,
```

El endpoint `/api/blockchain/estado` devuelve la URL interna del nodo BFA (`http://127.0.0.1:8545`). Aunque está protegido por auth, cualquier usuario autenticado puede ver la infraestructura interna.

**Fix:** Eliminar `rpcUrl` de la respuesta, o solo mostrar "conectado a BFA producción" sin la URL.

---

### 🟢 BAJO — S6: Keyfile path logueado en consola

**Archivo:** `services/blockchainService.js:412`

```js
console.log(`⚠️ Blockchain: keyfile no encontrado en ${keyfilePath} — modo solo lectura`);
```

El path del keyfile aparece en los logs del servidor. No se expone en responses HTTP, pero si alguien tiene acceso a logs podría localizar el archivo.

**Fix:** Loguear sin el path: `"⚠️ Blockchain: keyfile no encontrado — modo solo lectura"`.

---

### 🟢 BAJO — S7: LIMIT/OFFSET por interpolación de string

**Archivo:** `blockchainController.js:93`

```js
LIMIT ${limit} OFFSET ${offset}
```

Usa template literal en lugar de parámetros `?`. No es explotable porque `limit` y `offset` pasan por `parseInt()` + `Math.min/Math.max`, pero rompe el patrón de prepared statements del resto del código.

**Fix:** Usar `LIMIT ? OFFSET ?` con parámetros: `[...params, limit, offset]`.

---

### 🟢 BAJO — S8: Hashes insertados sin escapar en onclick handlers (frontend)

**Archivo:** `public/js/dataset-detail.js:254,264`

```js
onclick="copiarHash(this, '${ultimoCambio.hash_sellado}')"
```

Los hashes del API se insertan directamente en atributos `onclick`. Si un hash llegara con caracteres especiales (ej: `'`), habría XSS. En la práctica no es explotable porque los hashes son hex validados (`0x[0-9a-f]{64}`), pero falta defensa en profundidad.

**Fix:** Usar `data-hash` attribute + event listener en vez de inline onclick.

---

## BUGS

### 🟡 MEDIO — B1: Fallo inicial de sello no incrementa contador de intentos

**Archivo:** `services/blockchainService.js:212-214`

```js
enviarSello(registroId, hashHex).catch(error => {
    console.error(`❌ Blockchain: error sellando registro #${registroId}:`, error.message);
});
```

Si `enviarSello` falla en el primer intento (llamada desde `sellarHash`), el error se loguea pero **no se incrementa `intentos`** ni se guarda `error_detalle` en BD. El registro queda como `pendiente` con `intentos=0`. Los reintentos posteriores sí incrementan (línea 519-529).

**Impacto:** Se obtiene MAX_REINTENTOS + 1 intentos reales, y se pierde la info del primer error.

**Fix:** Dentro del `.catch`, actualizar `intentos` y `error_detalle` igual que en `iniciarReintentos`:
```js
enviarSello(registroId, hashHex).catch(async (error) => {
    console.error(`❌ Blockchain: error sellando registro #${registroId}:`, error.message);
    await pool.execute(
        `UPDATE blockchain_registros SET intentos = 1, error_detalle = ? WHERE id = ?`,
        [error.message, registroId]
    );
});
```

---

### 🟡 MEDIO — B2: Registros en estado 'error' quedan permanentemente estancados

**Archivo:** `services/blockchainService.js:507-511`

```js
WHERE estado = 'pendiente' AND intentos < ?
```

Los reintentos solo procesan registros con `estado = 'pendiente'`. Una vez que un registro llega a `estado = 'error'` (tras 10 intentos), no hay forma automática ni manual de reintentarlo.

**Fix:** Agregar un endpoint admin `POST /blockchain/reintentar/:id` que resetee `estado='pendiente'` e `intentos=0`, o un botón en el panel de estado blockchain.

---

### 🟡 MEDIO — B3: Estado 'enviando' no existe en BD — inconsistencia API/BD

**Archivo:** `services/blockchainService.js:216`

```js
return { success: true, registroId, estado: 'enviando' };
```

`sellarHash` devuelve `estado: 'enviando'` al caller, pero el registro en BD se creó como `'pendiente'` (línea 188). No existe estado `'enviando'` en la BD. El flujo real es: `pendiente → confirmado` (éxito) o `pendiente → error` (tras N reintentos).

**Impacto:** El frontend de certificar muestra "enviando" pero la BD dice "pendiente". Si alguien consulta la BD directamente, la máquina de estados no coincide con lo documentado.

**Fix:** O actualizar a `'enviando'` en BD antes de llamar `enviarSello`, o devolver `'pendiente'` al caller.

---

### 🟢 BAJO — B4: N+1 queries en endpoint /registro

**Archivo:** `blockchainController.js:119-130`

Para cada registro de tipo `cambio_dataset`, se ejecuta un `SELECT referencia_id FROM blockchain_registros WHERE id = ?` individual (línea 122-125). Con 20 registros por página, son hasta 20 queries extras.

**Fix:** Incluir `referencia_id` en el SELECT principal (línea 84) y comparar en memoria.

---

### 🟢 BAJO — B5: Timer de reintentos no se limpia al detener servidor

**Archivo:** `services/blockchainService.js:503`

```js
reintentoTimer = setInterval(async () => { ... }, REINTENTO_INTERVALO_MS);
```

El `setInterval` nunca se limpia. Si el servidor se detiene gracefully, el timer sigue activo y puede causar errores de pool de BD cerrado.

**Fix:** Exportar una función `detener()` que haga `clearInterval(reintentoTimer)` y llamarla en el shutdown hook del servidor.

---

## ASPECTOS POSITIVOS (sin hallazgos)

- **Parameterized queries:** Todas las consultas SQL usan `pool.execute()` con `?` (excepto S7, que no es explotable)
- **No se exponen stack traces:** Todos los `catch` devuelven mensajes genéricos al cliente
- **No se loguea private key ni password:** Solo se usa `cuenta.privateKey` para firmar, nunca aparece en logs ni responses
- **Blockchain no bloquea aprobación:** El sellado es post-commit y asíncrono; si blockchain falla, el cambio en BD ya está confirmado
- **Validación de hash correcta:** Tanto el controller (`/^0x[0-9a-fA-F]{64}$/`) como el frontend validan formato
- **Duplicados manejados:** `enviarSello` verifica `getBlockNo` antes de enviar transacción, evita gastar gas en duplicados
- **Wallet desde config:** `BFA_WALLET_ADDRESS` viene de `.env`, no hardcodeada
- **Cola de transacciones:** `enqueueTransaction` serializa envíos para evitar colisión de nonce
- **Sellado no-bloqueante:** `sellarHash` registra en BD como pendiente y envía async, sin bloquear la respuesta al usuario

---

## RESUMEN

| Severidad    | Cantidad | IDs             |
|--------------|----------|-----------------|
| 🔴 Crítico  | 3        | S1, S2, S3      |
| 🟡 Medio    | 5        | S4, S5, B1, B2, B3 |
| 🟢 Bajo     | 5        | S6, S7, S8, B4, B5 |

**Prioridad inmediata:** S1 (usar `adminOnly` en rutas de escritura), S2 (proteger ruta de notificaciones), S3 (fallar sin JWT_SECRET). Estos tres son explotables sin herramientas especiales, solo con `curl` y un token de usuario lector.
