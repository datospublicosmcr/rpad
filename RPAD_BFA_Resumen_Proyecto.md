# RPAD v1.5.0 + Blockchain Federal Argentina (BFA)
## Documento de Contexto para Implementación

**Fecha:** 7 de febrero de 2026 (actualizado tras implementar certificación voluntaria, QR, link BFA, fix 24h)
**Estado:** ✅ Nodo BFA propio sincronizado (~46M bloques). Sellado real funcionando (primer sello bloque 46012604). Certificación voluntaria implementada (Spec 13.6). Card blockchain con QR y link BFA.
**Autor:** Mariano Perez - Subsecretaría de Modernización, Municipalidad de Comodoro Rivadavia

---

## 1. ¿QUÉ ES ESTE PROYECTO?

**RPAD** (Registro Permanente de Actualización de Datasets) es un sistema web que controla qué datasets publica la Municipalidad de Comodoro Rivadavia en su Portal de Datos Abiertos, cumpliendo la Ordenanza 17.662/23 de Gobierno Abierto (Art. 8).

**Objetivo de esta integración:** Sellar automáticamente en la Blockchain Federal Argentina (BFA) cada cambio aprobado en datasets, haciendo el registro inmutable y verificable públicamente. Opcionalmente, certificar también el contenido de los archivos de datos (CSV, XLSX, etc.) mediante su hash SHA-256.

**Lo que ya funciona (v1.5.0):**
- Sistema de doble aprobación: un usuario propone un cambio → otro admin lo aprueba → se aplica
- Gestión completa de datasets (crear/editar/actualizar/eliminar)
- Generación de reportes PDF

**Lo que se agrega (v1.6.0):**
- Al aprobar un cambio → se sella el hash de operación en BFA automáticamente
- Al marcar como actualizado → se exige subir el archivo para calcular hash SHA-256 y certificarlo en BFA
- Botón "Certificar archivo" para datasets sin certificación previa (ej: eventuales)
- Portal público de verificación con QR (`verificar.html`)
- Card de certificación blockchain en detalle de dataset (`dataset.html`)
- Sello fundacional: hash del estado completo del sistema al momento de activar blockchain

---

## 2. BLOCKCHAIN FEDERAL ARGENTINA (BFA)

### Red
- **Tipo:** Pública argentina, Proof of Authority (PoA), fork Ethereum Byzantium
- **Gratuita:** No usa criptomonedas reales. El "Gas Distillery" recarga wallets automáticamente
- **Block time:** ~5 segundos
- **Verificación pública:** https://bfa.ar/sello2 y https://bfaexplorer.com.ar:8443/

### ⚠️ DESCUBRIMIENTO CRÍTICO: Nodo Público NO es para Producción

**Confirmado por Roberto Pereyra Pigerl** (grupo Telegram @bfatec, 03/02/2026):

> "El nodo transaccional no es productivo, debes usar tu propio nodo e implementar la api de tsa. Es muy sencillo, está en el repo."

El nodo `public.bfa.ar:8545` es solo para consultas casuales y pruebas. Para producción se requiere **nodo propio**.

### Nodos RPC

| Red | URL | Chain ID | Uso |
|-----|-----|----------|-----|
| **Nodo propio (PRODUCCIÓN)** | http://167.86.71.102:443 (nginx proxy → 8545) | 200941592 | ✅ NODO PROPIO EN VPS CONTABO — sincronizado |
| **Público (solo lectura)** | http://public.bfa.ar:8545 | 200941592 | ⚠️ Solo para consultas puntuales, NO para producción |
| **Test** | http://public.test2.bfa.ar:8545 | 99118822 | ✅ OPERATIVO — para desarrollo |

### ⚠️ PROBLEMA CRÍTICO RESUELTO: POA Middleware

BFA usa Proof of Authority y envía `extraData` de 97 bytes en sus bloques (el estándar Ethereum es 32 bytes). Las librerías web3 rechazan los bloques por defecto.

**Solución para Python (web3.py):**
```python
from web3.middleware import ExtraDataToPOAMiddleware
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
```

**Solución para Node.js (web3.js v4):** No se confirmó aún. En web3.js v1 no hacía falta (la beta 54 lo toleraba). Para web3.js v4 hay que investigar si necesita middleware similar o si lo maneja automáticamente.

---

## 3. INFRAESTRUCTURA: VPS CONTABO + NODO BFA

### VPS Contabo

| Campo | Valor |
|-------|-------|
| **Plan** | Cloud VPS 20 SSD |
| **CPU** | 6 vCPU |
| **RAM** | 12 GB |
| **Disco** | 200 GB SSD |
| **Red** | 300 Mbit/s |
| **SO** | Ubuntu 22.04.5 LTS + Docker 29.2.1 preinstalado |
| **IP** | 167.86.71.102 |
| **IPv6** | 2a02:c207:2306:2615::1/64 |
| **Región** | EU (Unión Europea) |
| **Latencia** | ~260ms desde Comodoro Rivadavia |
| **Costo** | €7.00/mes (€5.60/mes con plan anual, 20% descuento) |
| **Panel** | https://my.contabo.com — Cliente ID: 14600178 |
| **VMI ID** | vmi3062615 |

### ⚠️ Conexión SSH — Puerto Modificado

**Problema descubierto:** El ISP de Comodoro Rivadavia **bloquea el puerto 22 saliente**. SSH no conecta al puerto estándar.

**Solución aplicada:** Se cambió SSH al puerto 2222 en `/etc/ssh/sshd_config`.

**Comando de conexión:**
```
ssh root@167.86.71.102 -p 2222
```

**Nota:** VNC también está disponible como alternativa:
- VNC IP: 5.189.140.254:63154
- Se usó RealVNC Viewer para diagnóstico inicial

### Nodo BFA Docker

**Instalación realizada el 03/02/2026:**
```bash
wget -4 https://gitlab.bfa.ar/docker/bfanodo/raw/master/start.sh
bash start.sh latest
```

**Nota:** Se necesita `-4` en wget porque el servidor intenta IPv6 primero contra gitlab.bfa.ar y falla.

**Estado al dejar corriendo (03/02/2026 ~21:03 hs Argentina):**
- Container: `bfanodo` — imagen `bfaar/nodo:latest`
- Estado: Running (healthy)
- Puertos: 8545 (RPC local), 8546 (WebSocket), 30303 (P2P)
- **✅ Sincronizado** (confirmado 05/02/2026) — bloque ~45,996,005, importando de a 1 cada ~5s
- Acceso RPC via nginx reverse proxy en puerto 443 (WNPower no puede conectar al 8545 directo)

**Comandos útiles de monitoreo:**
```bash
# Ver estado del container
docker ps

# Ver últimos logs
docker logs --tail 20 bfanodo

# Ver estado detallado del nodo
docker exec bfanodo localstate.pl

# Si necesita reiniciar
docker restart bfanodo

# Verificar RPC (desde cualquier máquina)
curl http://167.86.71.102:443 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 4. ANÁLISIS TSA: v1 vs v2 (Decisión Tomada)

Se analizó el código fuente de ambas versiones de la API TSA de BFA.

### TSA API v1 (tsaapi.bfa.ar)
- Repo: `gitlab.bfa.ar/hhegykozi/tsa1` (Django 2.1, web3==4.5.0)
- Endpoints: `/api/tsa/stamp/` y `/api/tsa/verify/`
- Genera un "OTS hash" compuesto: hash(file + timestamp + account + version)
- **También necesita un nodo RPC detrás** — no elimina necesidad de infraestructura
- Los sellos quedan asociados a la wallet de la API de BFA, no a la wallet municipal

### TSA2 (elegida ✅)
- Repo: `gitlab.bfa.ar/blockchain/tsa2`
- Contrato Stamper.sol más simple: `put(hash)` con 1 parámetro
- Sellos asociados directamente a nuestra wallet municipal
- Código RPAD ya probado exitosamente contra TSA2
- URL verificación pública: `bfa.ar/sello2#/hash/...`
- Independencia total de servicios de BFA

### Decisión: TSA2 + Nodo Propio

| Aspecto | TSA v1 | TSA v2 (elegida) |
|---------|--------|------------------|
| Función stamp | `stamp(ots_hash, file_hash)` - 2 params | `put(hash)` - 1 param |
| OTS | Hash compuesto (file+timestamp+cuenta) | Solo hash del documento |
| Verificar | `verify(ots_hash, file_hash)` | `getStamp(hash)` devuelve bloque |
| Wallet | Usa cuenta de BFA (API pública) | Usa wallet municipal propia |
| Complejidad | Mayor | Más simple |
| Independencia | Depende de API BFA | 100% autónomo |

---

## 5. CONTRATO TSA2 (Timestamping Authority)

El contrato `Stamper.sol` (Solidity 0.5.2) permite sellar hashes de 32 bytes en la blockchain. Cada sello registra: el hash, quién lo selló, y en qué bloque.

### Direcciones del contrato

| Red | Dirección |
|-----|-----------|
| **Producción** | `0x7e56220069CAaF8367EA42817EA9210296AeC7c6` |
| **Test** | `0xFc0f01A88bD08b988173A2354952087C9492d947` |

### Funciones del contrato

| Función | Tipo | Descripción |
|---------|------|-------------|
| `put(bytes32[])` | **Escritura** | Sella un array de hashes. Es la función principal. |
| `getObjectCount(bytes32)` | Lectura | ¿Cuántas veces fue sellado este hash? (0 = no existe) |
| `getBlockNo(bytes32, address)` | Lectura | ¿En qué bloque lo selló esta wallet? (0 = nunca) |
| `getStamplistPos(uint256)` | Lectura | Obtener sello completo por posición (hash, stamper, blockNo) |
| `getObjectPos(bytes32, uint256)` | Lectura | Posición en stampList de la N-ésima vez que se selló este hash |
| `getStamperCount(address)` | Lectura | Total de sellos que hizo esta wallet |
| `getStamperPos(address, uint256)` | Lectura | Posición en stampList del N-ésimo sello de esta wallet |

### Evento
```solidity
event Stamped(address indexed from, bytes32 indexed object, uint256 blockNo);
```

### ABI completa (para inicializar el contrato en web3)
```json
[
  {"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"object","type":"bytes32"},{"indexed":false,"name":"blockNo","type":"uint256"}],"name":"Stamped","type":"event"},
  {"constant":false,"inputs":[{"name":"objectList","type":"bytes32[]"}],"name":"put","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":true,"inputs":[{"name":"pos","type":"uint256"}],"name":"getStamplistPos","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"address"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[{"name":"object","type":"bytes32"}],"name":"getObjectCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[{"name":"object","type":"bytes32"},{"name":"pos","type":"uint256"}],"name":"getObjectPos","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[{"name":"object","type":"bytes32"},{"name":"stamper","type":"address"}],"name":"getBlockNo","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[{"name":"stamper","type":"address"}],"name":"getStamperCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[{"name":"stamper","type":"address"},{"name":"pos","type":"uint256"}],"name":"getStamperPos","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}
]
```

---

## 6. WALLET MUNICIPAL

| Campo | Valor |
|-------|-------|
| **Nombre** | rpad-comodoro-rivadavia |
| **Dirección** | `0x53c4D8cb6f5Fb6BaFC3b158ae582a8Fb18dCc1C9` |
| **Keyfile** | `/home/datospublicos/rpad/keystore/UTC--2026-02-02T23-56-25.652283700Z--53c4d8cb6f5fb6bafc3b158ae582a8fb18dcc1c9` (en WNPower) |
| **Password** | `Investigacion965!` |
| **Estado** | ✅ Verificada en registro.bfa.ar |
| **Balance (Producción)** | ✅ **1 ETH** (1,000,000,000,000,000,000 Wei) — máximo permitido, recargada por Gas Distillery |
| **Balance (Test)** | 0 Wei (puede requerir gas por separado) |

---

## 7. TESTS DE CONEXIÓN EXITOSOS (Red Test)

Se ejecutó un script Python con 7 pasos, todos exitosos:

1. ✅ RPC conectado a http://public.test2.bfa.ar:8545
2. ✅ Network: Chain ID 99118822, Block #36,494,406
3. ✅ Balance wallet consultado (0 Wei en test)
4. ✅ Contrato TSA2 verificado (2249 bytes bytecode, creado 11/06/2019)
5. ✅ Lectura de 5 sellos históricos reales del contrato (todos del 21/06/2019)
6. ✅ Verificación de hash funciona (hash no encontrado devuelve count=0, correcto)
7. ✅ Consulta por wallet funciona (0 stamps para nuestra wallet, correcto)

**Conclusión:** Toda la comunicación con BFA funciona. La wallet ya tiene gas (1 ETH en producción). Cuando el nodo propio sincronice, se puede sellar inmediatamente.

---

## 8. ARQUITECTURA FINAL

```
RPAD (Node.js v22.18 en WNPower, puerto 3001)
    │
    │ web3.js v4 (HTTP Provider)
    │ URL: http://167.86.71.102:443
    ↓
nginx reverse proxy (Contabo VPS, puerto 443)
    │
    │ proxy_pass → 127.0.0.1:8545
    ↓
Nodo BFA propio (Docker en Contabo VPS, puerto 8545 solo local)
    │
    │ P2P (puerto 30303)
    ↓
Red BFA (producción, Chain ID 200941592)
    │
    ↓
Contrato TSA2: 0x7e56220069CAaF8367EA42817EA9210296AeC7c6
    │
    ↓
Wallet municipal: 0x53c4D8cb6f5Fb6BaFC3b158ae582a8Fb18dCc1C9
```

**¿Por qué nginx en el medio?** WNPower (hosting compartido) bloquea conexiones salientes a puertos no estándar como 8545. El proxy nginx escucha en el puerto 443 (permitido) y reenvía al nodo BFA en 8545 (local). Para RPAD es transparente.

**Configuración nginx** (`/etc/nginx/sites-available/bfa-proxy` en VPS Contabo):
```nginx
server {
    listen 443;
    location / {
        proxy_pass http://127.0.0.1:8545;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Ventajas de esta arquitectura:**
- Independencia total de servicios BFA (no depende de public.bfa.ar)
- Sellos asociados a wallet municipal (trazabilidad institucional)
- Control completo sobre infraestructura
- Costo predecible (€67.20/año ≈ $75 USD/año)
- Escalable (puede mover a VPS más grande si crece)
- Nodo auto-restart si se cae (Docker restart policy)

---

## 9. ARQUITECTURA RPAD ACTUAL

### Stack Tecnológico
- **Backend:** Node.js + Express (ES Modules)
- **Base de datos:** MariaDB 10.11 (mysql2/promise)
- **Frontend:** HTML + CSS + JavaScript vanilla (Lucide icons)
- **Puerto:** 3001
- **CORS:** http://rpad.mcrmodernizacion.gob.ar
- **Autenticación:** JWT (no afecta la integración blockchain)

### Archivos Backend Clave

| Archivo | Líneas | Rol |
|---------|--------|-----|
| `app.js` | 93 | Express setup, rutas, middleware |
| `config/database.js` | 33 | Pool MariaDB con mysql2/promise |
| `controllers/cambiosPendientesController.js` | 642 | **⭐ PUNTO DE INTEGRACIÓN** - Sistema doble aprobación |
| `controllers/datasetController.js` | 627 | CRUD datasets (crea cambios pendientes) |
| `controllers/reportesController.js` | 892 | Generación PDFs |

### Archivos Frontend Clave

| Archivo | Líneas | Rol |
|---------|--------|-----|
| `public/js/admin.js` | 853 | Panel administración (aprobar/rechazar cambios) |
| `public/js/main.js` | 353 | Layout, navegación, Lucide icons |
| `public/js/datasets.js` | 327 | Gestión datasets |
| `public/js/reportes.js` | 130 | Interfaz reportes |

### Base de Datos Actual (`datospublicos_mcr_rpad`)

**Tablas principales:**
- `datasets` — titulo, descripcion, area_id, frecuencia_id, url_dataset, activo, etc.
- `cambios_pendientes` — tipo_cambio (crear/editar/actualizar/eliminar), dataset_id, datos_nuevos (JSON), datos_anteriores (JSON), usuario_id, estado, revisor_id, revisado_at
- `areas`, `frecuencias`, `formatos`, `temas`, `dataset_formatos`
- `historial_actualizaciones`, `notificaciones_log`
- `usuarios` — con roles y permisos

**Observaciones del esquema SQL (verificado 05/02/2026):**
- `datos_nuevos` tiene constraint `CHECK (json_valid())` — confirma que guardar `file_hash` dentro del JSON es compatible
- `historial_actualizaciones` existe en la BD pero NO se usa en ningún controller actual — fue reemplazada por el sistema de `cambios_pendientes` en v1.5. No la tocamos
- ENUM actual de `tipo_cambio` es `('crear','editar','eliminar')` — confirma que el ALTER TABLE para agregar `'actualizar'` es necesario

---

## 10. PUNTO DE INTEGRACIÓN: aprobarCambio()

La función `aprobarCambio()` en `cambiosPendientesController.js` (líneas 363-516) es donde se integra el sellado blockchain. El flujo actual es:

```
1. Validar cambio pendiente existe (línea 371)
2. Verificar que el revisor no sea el mismo que propuso (línea 387)
3. beginTransaction() (línea 399)
4. Según tipo_cambio:
   - 'crear' → INSERT INTO datasets (línea 406)
   - 'editar' → UPDATE datasets (línea 440)
   - 'actualizar' → mismo UPDATE que 'editar' (v1.6, reutiliza lógica) + file_hash obligatorio
   - 'eliminar' → UPDATE datasets SET activo=FALSE (línea 484)
5. UPDATE cambios_pendientes SET estado='aprobado' (línea 491)
6. commit() (línea 498) ← ✅ DESPUÉS DE ESTA LÍNEA SE SELLA EN BLOCKCHAIN
7. res.json({ success: true }) (línea 501)
```

### El sellado va DESPUÉS del commit (línea 498) porque:
- El cambio en la BD ya es definitivo
- Si blockchain falla, el cambio sigue siendo válido (no bloqueamos operación municipal)
- Se puede reintentar el sellado más tarde
- El hash incluye datos del cambio ya confirmado (con IDs reales)

### Datos que se sellan: Tres niveles

**Nivel 1 — Qué se hashea** (entra en el cálculo SHA-256 del hash de operación):
Nadie puede "abrir" un hash SHA-256 para ver qué hay adentro — es irreversible. Se incluyen IDs de usuario para fortalecer la integridad sin riesgo de exposición.

```javascript
const datosParaSellar = {
  version: "1.0",
  tipo: "cambio_dataset",
  tipo_cambio: cambio.tipo_cambio,         // 'crear', 'editar', 'actualizar', 'eliminar'
  dataset_id: datasetId,                    // ID del dataset afectado
  datos_nuevos: cambio.datos_nuevos,        // JSON con datos nuevos
  datos_anteriores: cambio.datos_anteriores, // JSON con datos previos (null si crear)
  doble_verificacion: true,
  usuario_id: cambio.usuario_id,            // Quién propuso (para integridad, no se muestra)
  revisor_id: revisorId,                    // Quién aprobó (para integridad, no se muestra)
  timestamp: new Date().toISOString()       // Momento del sellado
};
// Se calcula SHA-256 de JSON.stringify(datosParaSellar) → bytes32 para put()
```

**Para el hash de archivo:** SHA-256 directo del contenido binario del archivo, sin metadata envolvente. Así cualquier persona puede descargar el archivo del portal, calcular el hash por su cuenta, y comparar.

**Nivel 2 — Qué se guarda en `metadata`** (columna JSON en `blockchain_registros`):
Todo lo que se hasheó, incluyendo IDs de usuario. Permite reproducir el hash para auditoría interna. Solo visible para admins en la base de datos.

**Nivel 3 — Qué se muestra públicamente** (en `dataset.html` y `verificar.html`):
Solo lo necesario para confirmar que el registro existe y es válido. Sin IDs de usuario, sin nombres de admins, sin datos crudos del cambio.

En `dataset.html`:
- "Registrado en Blockchain Federal Argentina"
- Última operación: "Creación" / "Actualización de metadatos" / "Eliminación"
- Fecha de registro
- Bloque BFA
- "Doble verificación ✓" (sin nombres de quién aprobó/propuso)
- Hash de operación (copiable)
- Hash de archivo (copiable, si existe)
- Links: "Ver en BFA Explorer" y "Verificar integridad"
- QR con URL de verificación

En `verificar.html`:
- Tabla: Dataset, Operación, Área responsable, Fecha, Verificación, Blockchain
- Sin columna de "quién aprobó"
- Una fila por operación; si tiene hash de archivo: "Doble verificación + Archivo certificado"

Endpoint público `/api/blockchain/verificar/:hash` devuelve:
```json
{
  "encontrado": true,
  "tipo": "cambio_dataset",
  "dataset_titulo": "Presupuesto 2025",
  "tipo_cambio": "crear",
  "area_nombre": "Sec. de Hacienda",
  "timestamp": "2026-02-05T15:32:18Z",
  "doble_verificacion": true,
  "block_number": 45892341,
  "tx_hash": "0x...",
  "network": "produccion"
}
```

---

## 11. QUÉ SE SELLA Y QUÉ NO

### ✅ SE SELLA (hash de operación):
1. **Cambios aprobados** en datasets (crear/editar/actualizar/eliminar) — después del commit en aprobarCambio()
2. **Sello fundacional** — hash del estado completo del sistema al activar blockchain (una única vez)

### ✅ SE SELLA (hash de archivo — registro separado):
1. **Al marcar como actualizado** (`tipo_cambio='actualizar'`) — OBLIGATORIO. El file_hash viaja dentro de `datos_nuevos.file_hash`
2. **Al crear un dataset** (`tipo_cambio='crear'`) — OPCIONAL. Si el usuario sube el archivo al crear, el file_hash viaja en `datos_nuevos.file_hash`
3. **Certificación voluntaria** — Botón "Certificar archivo" en admin para datasets sin certificación previa

### Regla de file_hash por tipo_cambio:
| tipo_cambio | file_hash | Regla |
|-------------|-----------|-------|
| `actualizar` | OBLIGATORIO | No se puede marcar como actualizado sin subir archivo |
| `crear` | OPCIONAL | Si el usuario sube archivo, se certifica |
| `editar` | NO APLICA | Edición de metadatos no certifica archivo |
| `eliminar` | NO APLICA | Eliminación no certifica archivo |

### ❌ NO SE SELLA:
- Reportes PDF (son documentos internos)
- Cambios rechazados
- Cambios pendientes de aprobación
- Notas administrativas (DOCX)
- Ediciones de metadatos que no cambian fecha de actualización (solo se sella el hash de operación, no de archivo)

### Dos registros separados por operación
Cada operación que incluye archivo genera **dos registros** en `blockchain_registros`:
- Uno de tipo `cambio_dataset` → hash de operación (certifica que el registro pasó por doble verificación)
- Uno de tipo `certificacion_archivo` → hash del archivo (certifica el contenido del dataset)

Tienen momentos de sellado y lifecycle distintos. El card en `dataset.html` muestra los datos del último de cada tipo. En `verificar.html` aparecen como una fila por operación, con indicador de si tiene archivo certificado.

### Datasets sin certificación
Si un dataset no tiene ningún registro en `blockchain_registros`, la sección de certificación **no se muestra** en `dataset.html` — ni pública ni logueado. No se muestra que "falta" algo.

### Datasets existentes (78 al momento de migración)
No se certifican retroactivamente. Se certifican orgánicamente cuando cada uno se actualice por primera vez bajo el nuevo sistema. Para datasets eventuales (sin fecha de actualización), se puede usar el botón "Certificar archivo" voluntariamente.

---

## 12. TABLA NUEVA: blockchain_registros

```sql
CREATE TABLE blockchain_registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('cambio_dataset', 'certificacion_archivo', 'sello_fundacional') NOT NULL,
  referencia_id INT DEFAULT NULL COMMENT 'ID del cambio_pendiente aprobado (NULL para sello_fundacional)',
  dataset_id INT DEFAULT NULL COMMENT 'Dataset relacionado (NULL para sello_fundacional)',
  hash_sellado VARCHAR(66) NOT NULL COMMENT 'Hash SHA-256 con prefijo 0x (hash de operación o de archivo)',
  file_hash VARCHAR(66) DEFAULT NULL COMMENT 'Hash SHA-256 del archivo (solo para certificacion_archivo)',
  tx_hash VARCHAR(66) DEFAULT NULL COMMENT 'Hash de la transacción blockchain',
  block_number BIGINT DEFAULT NULL COMMENT 'Número de bloque donde quedó sellado',
  network VARCHAR(20) DEFAULT 'produccion' COMMENT 'produccion o test',
  estado ENUM('pendiente', 'confirmado', 'error') DEFAULT 'pendiente',
  intentos INT DEFAULT 0,
  error_detalle TEXT DEFAULT NULL,
  metadata JSON DEFAULT NULL COMMENT 'Datos completos que se hashearon (interno, no se expone)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_hash (hash_sellado),
  INDEX idx_file_hash (file_hash),
  INDEX idx_tx (tx_hash),
  INDEX idx_referencia (tipo, referencia_id),
  INDEX idx_dataset (dataset_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Notas sobre la tabla
- `tipo`: `cambio_dataset` para hash de operación, `certificacion_archivo` para hash de archivo, `sello_fundacional` para el sello inicial del sistema
- `file_hash`: Permite buscar por hash de archivo en el verificador sin parsear JSON de metadata
- `hash_sellado`: Es el hash que se envía al contrato TSA2 via `put()`
- `metadata`: Contiene todos los datos que se hashearon (incluyendo IDs de usuario). Solo para auditoría interna, nunca se expone públicamente
- Un dataset actualizado genera 2 registros: uno `cambio_dataset` + uno `certificacion_archivo`
- Cada actualización genera nuevos registros; `dataset.html` muestra el último de cada tipo

### Migración requerida en tabla existente `cambios_pendientes`

```sql
-- Agregar tipo_cambio 'actualizar' al ENUM existente
ALTER TABLE cambios_pendientes 
MODIFY COLUMN tipo_cambio ENUM('crear','editar','eliminar','actualizar') NOT NULL;
```

**Motivo:** "Marcar como actualizado" (`tipo_cambio='actualizar'`) es semánticamente distinto de "editar metadatos" (`tipo_cambio='editar'`). Esta distinción permite:
- Lógica clara de file_hash obligatorio/opcional en `aprobarCambio()`
- Etiquetas más descriptivas en `verificar.html` ("Actualización de datos" vs "Edición de metadatos")
- Hash de operación con tipo_cambio correcto en blockchain

**Almacenamiento del file_hash entre propuesta y aprobación:**
El `file_hash` se guarda dentro de `datos_nuevos` (columna JSON de `cambios_pendientes`). No se crea nueva columna. Cuando `aprobarCambio()` parsea `datos_nuevos`, el file_hash ya está disponible para crear el registro `certificacion_archivo`.

---

## 13. MÓDULOS A CREAR / MODIFICAR

### 13.1. blockchainService.js (nuevo archivo backend)

Servicio centralizado para toda la interacción con BFA:

```
Funciones necesarias:
- inicializar()        → Conectar web3, cargar contrato, desencriptar wallet
- sellarHash(hash)     → Enviar transacción put([hash]) al contrato TSA2
- verificarHash(hash)  → Consultar getObjectCount() y getBlockNo()
- obtenerSello(hash)   → Obtener detalles completos del sello
- getEstado()          → Devolver estado de conexión, balance, últimos sellos
```

**Requisitos técnicos:**
- Usar web3.js v4 (evaluar si necesita POA middleware)
- Manejar errores de red sin bloquear RPAD
- Reintentar sellos fallidos (cola de reintentos)
- Configuración por variables de entorno (.env)
- Logging detallado

### 13.2. Modificar cambiosPendientesController.js

Después de la línea 498 (commit), agregar:
```javascript
// Sellado blockchain - Hash de operación (no bloqueante)
try {
  const hashData = {
    version: "1.0",
    tipo: "cambio_dataset",
    tipo_cambio: cambio.tipo_cambio, // 'crear', 'editar', 'actualizar', 'eliminar'
    dataset_id: datasetId, datos_nuevos, datos_anteriores,
    doble_verificacion: true,
    usuario_id: cambio.usuario_id, revisor_id: revisorId,
    timestamp: new Date().toISOString()
  };
  const hashHex = calcularHash(hashData);
  sellarEnBlockchain(hashHex, { tipo: 'cambio_dataset', referencia_id: id, dataset_id: datasetId });

  // Si hay file_hash en datos_nuevos → crear segundo registro (certificacion_archivo)
  if (datosNuevos.file_hash) {
    sellarEnBlockchain(datosNuevos.file_hash, {
      tipo: 'certificacion_archivo', referencia_id: id, dataset_id: datasetId
    });
  }
} catch (blockchainError) {
  console.error('Error blockchain (no crítico):', blockchainError);
}
```

**Lógica de `aprobarCambio()` para el tipo 'actualizar':**
- Reutiliza la misma lógica de UPDATE dinámico que `'editar'` (registrarActualizacion solo mete fechas en datos_nuevos, así que el UPDATE solo toca esas columnas)
- Código: `if (cambio.tipo_cambio === 'editar' || cambio.tipo_cambio === 'actualizar') { ... mismo bloque UPDATE ... }`
- La diferencia es que 'actualizar' siempre trae `datos_nuevos.file_hash`, y 'editar' nunca lo trae

### 13.3. Modificar datasetController.js — registrarActualizacion()

Dos cambios:
1. **Recibir `file_hash` obligatorio** desde el frontend
2. **Cambiar tipo_cambio de `'editar'` a `'actualizar'`** para distinguir en aprobarCambio()

```javascript
const { fecha_actualizacion, notas, file_hash } = req.body;

// Validar que file_hash esté presente (obligatorio para 'actualizar')
if (!file_hash) {
  return res.status(400).json({ success: false, error: 'Debe subir el archivo para certificar' });
}

// file_hash viaja dentro de datos_nuevos
const datosNuevos = {
  ultima_actualizacion: fechaActualizacion,
  proxima_actualizacion: proximaActualizacion,
  notas: notas || null,
  file_hash: file_hash  // ← SHA-256 calculado en el navegador
};

// Cambio: tipo_cambio='actualizar' (antes era 'editar')
const cambioId = await crearCambioPendiente('actualizar', Number(id), datosNuevos, datosAnteriores, usuarioId);
```

**Nota:** El `file_hash` queda persistido en la columna `datos_nuevos` (JSON) de `cambios_pendientes`. Cuando otro admin aprueba el cambio, `aprobarCambio()` lo extrae de `datosNuevos.file_hash` y crea el registro `certificacion_archivo`.

### 13.4. Modificar admin.js — Modal "Marcar como actualizado"

Agregar zona de drag & drop para archivo:
- El usuario arrastra o selecciona el archivo (CSV, XLSX, etc.)
- Se calcula SHA-256 en el navegador usando Web Crypto API (`crypto.subtle.digest('SHA-256', buffer)`)
- Se muestra el hash calculado al usuario
- El archivo NO se sube al servidor — solo se envía el hash como string
- El campo es obligatorio: no se puede marcar como actualizado sin subir archivo

### 13.5. Modificar admin.js — Modal "Nuevo Dataset"

Agregar zona de drag & drop OPCIONAL para archivo:
- Mismo mecanismo de cálculo de hash en navegador
- Si el usuario sube archivo, se envía `file_hash` junto con los datos del dataset → se guarda en `datos_nuevos.file_hash`
- Si no sube, se crea sin hash de archivo (solo se sellará el hash de operación)
- En `aprobarCambio()`, la lógica `if (datosNuevos.file_hash)` funciona igual para `'crear'` que para `'actualizar'`

### 13.6. Nuevo: Botón "Certificar archivo" en admin.html — ✅ IMPLEMENTADO (07/02/2026)

Nuevo botón (ícono escudo) en la tabla de datasets, entre "Marcar actualizado" y "Editar":
- Aparece para TODOS los datasets (no bloqueado por cambios pendientes)
- Al hacer clic, abre modal con zona de drag & drop (reutiliza `inicializarDropZone()`)
- Se calcula hash SHA-256 en el navegador
- Al confirmar → `POST /api/blockchain/certificar` con `{ dataset_id, file_hash }`
- Backend valida dataset existe y `activo = 1`, valida formato hash, llama `sellarHash()` no-bloqueante
- Responde `{ registroId, estado }` — el sello se confirma async en blockchain

**Archivos modificados:**
- `controllers/blockchainController.js` — nueva función `certificar`
- `routes/index.js` — ruta `POST /blockchain/certificar` (protegida con authMiddleware)
- `public/js/api.js` — método `API.certificarArchivo(datasetId, datos)`
- `public/admin.html` — modal `#modal-certificar-archivo` con dropzone, columna acciones a 200px
- `public/js/admin.js` — funciones `abrirCertificarArchivo()`, `closeCertificarArchivoModal()`, `confirmarCertificarArchivo()`

**Testeado:** Certificación voluntaria exitosa, registro confirmado en blockchain.

### 13.7. Nuevo: verificar.html (página pública, sin login)

Página de auditoría pública con dos secciones:

**Verificador de Registros:**
- Dos pestañas: "Verificar por hash" y "Verificar archivo"
- Verificar por hash: input para pegar hash → consulta `/api/blockchain/verificar/:hash` → muestra resultado
- Verificar archivo: zona drag & drop → calcula SHA-256 en navegador → busca en BD → muestra si fue certificado

**Registro de Operaciones Aprobadas:**
- Tabla pública con: Dataset (clickeable), Operación (badge), Área responsable, Fecha, Verificación, Blockchain
- Indicador "Doble verificación" para todas las operaciones
- Indicador "+ Archivo certificado" si la operación tiene hash de archivo asociado
- Filtros por área y tipo de operación
- Paginado
- Leyenda al pie: "Sellado en blockchain" / "Pendiente de sellar" / "Doble verificación interna"
- Nota de alcance de la certificación

### 13.8. Modificar dataset.html — Card de certificación — ✅ IMPLEMENTADO

Card de certificación blockchain en `dataset.html` con diseño header azul oscuro + logo BFA:
- Solo se muestra si el dataset tiene registros en `blockchain_registros`
- Header: logo BFA + "Certificación Blockchain" + badge "Verificado en BFA"
- Metadata: operación, fecha, bloque BFA
- Hash de operación (copiable con botón copiar)
- Hash de archivo (copiable, usa `file_hash` del registro `certificacion_archivo`)
- **QR de verificación** (120x120px, librería `qrcode-generator` v1.4.4 via cdnjs CDN ~4KB, genera SVG inline)
  - Codifica URL: `{origin}/verificar.html?hash={hashParaVerificar}`
  - Texto: "Escaneá para verificar"
- **Link "Ver en BFA"**: apunta a `https://bfa.escribanodigital.ar//verificar#/hash/{hash_sin_0x}` (nueva pestaña)
- Link "Verificar integridad": apunta a `verificar.html?hash=...` (interno)
- Nota de alcance al pie

**Archivos:** `dataset.html` (CSS + CDN script), `dataset-detail.js` (renderizado card + QR)

**Fix aplicado:** Formato de hora 24h (`hour12: false`) en `verificar.html` y `dashboard.js`

### 13.9. Rutas de verificación pública

```
GET /api/blockchain/verificar/:hash     → consulta BD + BFA, devuelve datos públicos del sello
GET /api/blockchain/estado              → estado de conexión, balance, stats (protegido)
GET /api/blockchain/registro            → listado paginado de operaciones (público)
GET /api/blockchain/dataset/:id         → registros blockchain de un dataset (público)
```

El endpoint `/api/blockchain/verificar/:hash` es público con rate limiting. No expone datos sensibles.

### 13.10. Sello fundacional (script one-time)

Script a ejecutar una única vez al activar la v1.6:
1. Consulta todos los datasets activos con sus metadatos
2. Genera JSON ordenado y determinístico del estado completo del sistema
3. Calcula SHA-256 del JSON
4. Sella en blockchain como registro de tipo `sello_fundacional`
5. Se muestra en `verificar.html` como elemento destacado

---

## 14. CÓDIGO DE REFERENCIA BFA (Node.js)

El repositorio oficial de BFA incluye un ejemplo funcional en `tsa2/v2.0/api/src/`. Los archivos clave son:

### Cómo conectar y sellar (extraído de index.js y StamperWrapper.js):
```javascript
// Conectar a BFA (apuntando a nodo propio)
const web3 = new Web3(new Web3.providers.HttpProvider('http://167.86.71.102:443'));

// Cargar wallet desde keyfile
const rawKey = fs.readFileSync(KEYFILE_PATH);
const keyJson = JSON.parse(rawKey);
const key = web3.eth.accounts.decrypt(keyJson, PASSWORD);
const walletAccount = web3.eth.accounts.wallet.add(key);

// Cargar contrato
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// Sellar un hash
const methodPut = contract.methods.put([hashBytes32]);
const encodedABI = methodPut.encodeABI();
const tx = {
  to: CONTRACT_ADDRESS,
  gas: 2000000,
  data: encodedABI,
  chainId: BFA_CHAIN_ID, // 200941592 para producción, 99118822 para test
  nonce: await web3.eth.getTransactionCount(walletAccount.address)
};
const signedTx = await walletAccount.signTransaction(tx);
const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
// receipt.blockNumber = bloque donde quedó sellado

// Verificar un hash
const count = await contract.methods.getObjectCount(hash).call();
if (count > 0) {
  const blockNo = await contract.methods.getBlockNo(hash, walletAddress).call();
  const block = await web3.eth.getBlock(blockNo);
  // block.timestamp = timestamp UNIX del sello
}
```

### Flujo de verificación:
```
getObjectCount(hash) → ¿Cuántas veces fue sellado?
  Si 0 → No existe
  Si > 0 → getObjectPos(hash, 0) → posición en stampList
         → getStamplistPos(pos) → (hash, stamper, blockNo)
         → web3.eth.getBlock(blockNo) → timestamp del bloque
```

### Auditoría del código fuente TSA2 (05/02/2026)

Se revisaron los archivos fuente del repo `gitlab.bfa.ar/blockchain/tsa2`:
- `contract/contracts/Stamper.sol` — Contrato Solidity (107 líneas)
- `api/src/index.js` — Servidor Express con endpoints /stamp y /verify
- `api/src/StamperWrapper.js` — Wrapper de interacción con el contrato
- `api/abi.json` — ABI del contrato con campos `signature` de Truffle

#### ✅ Confirmado — coincide con el documento:

| Aspecto | Estado |
|---------|--------|
| ABI: 7 funciones + 1 evento | ✅ Coincide (abi.json agrega campo `signature` de Truffle, ignorable por web3) |
| `put()` recibe `bytes32[]` (array) | ✅ Confirmado en Stamper.sol línea 42 |
| Flujo firma: encodeABI → signTransaction → sendSignedTransaction | ✅ Confirmado en StamperWrapper.js líneas 49-68 |
| Firma con keyfile V3 desencriptado | ✅ Confirmado en index.js líneas 38-41 |
| `getBlockNo(hash, address)` devuelve nro de bloque | ✅ Confirmado en Stamper.sol líneas 83-94 |
| Gas limit 2000000 | ✅ Confirmado en StamperWrapper.js línea 50 |

#### ⚠️ Hallazgos que requieren acción en blockchainService.js:

**1. chainId hardcodeado a testnet en código original**
StamperWrapper.js línea 56: `chainId: '99118822'` (testnet). Para producción es `200941592`.
→ **Solución:** Usar variable de entorno `BFA_CHAIN_ID`. Ya contemplado en nuestro .env.

**2. Nonce: incremento local sin mutex**
index.js línea 50 inicializa `txnonce` una vez al arrancar. StamperWrapper.js línea 59 hace `nonce: this.web3.bfa.txnonce++` (incremento local). Si dos transacciones se envían simultáneamente (dos admins aprobando al mismo tiempo), colisionan.
→ **Solución:** Implementar mutex/cola de transacciones en blockchainService.js para serializar envíos. Dado que el sellado es post-commit y asíncrono, una cola simple (FIFO) resuelve el problema sin afectar la experiencia del usuario.

**3. El contrato `put()` NO verifica duplicados**
Stamper.sol líneas 42-61: `put()` agrega una entrada nueva siempre, sin verificar si el hash ya fue sellado por la misma wallet. Es StamperWrapper.js (línea 27) el que hace `getBlockNo()` antes de sellar y devuelve `already_stamped_by_this_TSA`.
→ **Solución:** Replicar esta verificación en blockchainService.js antes de enviar transacción, para evitar gastar gas en reintentos duplicados.

**4. `getBlockNo()` devuelve solo la PRIMERA vez**
Stamper.sol líneas 83-94: itera los sellos y retorna el blockNo del primer match para ese stamper. Si se sella el mismo hash de archivo dos veces (archivo no cambió entre actualizaciones), `getBlockNo()` devuelve el sello original.
→ **Solución:** Para verificación completa usar la cadena `getObjectCount()` → `getObjectPos()` → `getStamplistPos()` como ya tenemos en el flujo de verificación. Para nuestros hashes de operación no es problema porque incluyen timestamp (siempre únicos).

**5. web3.js v1 → v4: diferencias de API**
El código TSA2 usa web3.js v1. En v4 cambian algunas interfaces:
- `web3.eth.net.getId()` → `web3.eth.getChainId()` (en v4 devuelve BigInt)
- `web3.eth.accounts.decrypt()` → misma interfaz, verificar
- `sendSignedTransaction()` → misma interfaz, verificar que `rawTransaction` esté en el receipt
- BigInt handling: v4 devuelve BigInt en lugar de strings/numbers para valores numéricos grandes
→ **Solución:** Verificar estas diferencias al implementar blockchainService.js. Testear contra red test antes de producción.

**6. ABI limpia vs ABI con signatures**
El archivo `abi.json` del repo incluye campos `signature` extra (ej: `"signature": "0x3a00faae"` para `put`). Son metadatos de Truffle.
→ **Solución:** Usar la ABI limpia (sin `signature`) en nuestro blockchainService.js. web3.js v4 podría rechazar campos desconocidos.

---

## 15. VARIABLES DE ENTORNO NECESARIAS (.env)

```env
# BFA Blockchain — Nodo propio
BFA_RPC_URL=http://167.86.71.102:443
BFA_RPC_URL_TEST=http://public.test2.bfa.ar:8545
BFA_NETWORK=produccion
BFA_CONTRACT_ADDRESS=0x7e56220069CAaF8367EA42817EA9210296AeC7c6
BFA_CONTRACT_ADDRESS_TEST=0xFc0f01A88bD08b988173A2354952087C9492d947
BFA_KEYFILE_PATH=/home/datospublicos/rpad/keystore/UTC--2026-02-02T23-56-25.652283700Z--53c4d8cb6f5fb6bafc3b158ae582a8fb18dcc1c9
BFA_WALLET_PASSWORD=Investigacion965!
BFA_WALLET_ADDRESS=0x53c4D8cb6f5Fb6BaFC3b158ae582a8Fb18dCc1C9
BFA_CHAIN_ID=200941592
BFA_CHAIN_ID_TEST=99118822
BFA_GAS_LIMIT=2000000
```

**⚠️ Ubicación del keyfile:** El keyfile está en **WNPower** (donde corre RPAD), NO en el VPS de Contabo. Esto es correcto porque `blockchainService.js` corre como parte de RPAD y se conecta al nodo BFA remotamente via HTTP.
- Ruta actual: `/home/datospublicos/rpad/keystore/UTC--2026-02-02T23-56-25.652283700Z--53c4d8cb6f5fb6bafc3b158ae582a8fb18dcc1c9`
- Permisos recomendados: `chmod 600` (restringir lectura solo al owner)
- El VPS de Contabo solo ejecuta el nodo BFA Docker, no necesita el keyfile

---

## 16. DECISIONES TÉCNICAS YA TOMADAS

| Decisión | Elegido | Por qué |
|----------|---------|---------|
| Infraestructura | Nodo BFA propio en VPS | Roberto confirmó que nodo público no es para producción |
| VPS | Contabo Cloud VPS 20 (€7/mes) | Mejor relación precio/specs, Docker preinstalado |
| TSA | TSA2 (no TSA v1) | Más simple, sellos con wallet propia, código ya probado |
| Lenguaje blockchain | Node.js (web3.js) | Mismo stack que RPAD, evita agregar Python |
| Versión web3.js | v4.x | Versión moderna y mantenida |
| Sellado | Asíncrono, no bloqueante | Si BFA cae, RPAD sigue funcionando |
| Reintentos | Cola con backoff | Sellos fallidos se reintentan automáticamente |
| Hash | SHA-256 → bytes32 | Compatible con contrato Stamper.sol |
| Red | Producción (tiene gas) | Wallet ya cargada con 1 ETH en producción |
| Datos en blockchain | Solo el hash | Datos reales quedan en servidor municipal |
| Seguridad keyfile | Variable de entorno | No hardcodear password en código |
| SSH VPS | Puerto 2222 | ISP Comodoro bloquea puerto 22 saliente |
| Sellado de reportes PDF | NO se sellan | Son documentos internos, no aporta valor |
| Hash de archivo | Obligatorio al actualizar, opcional al crear | SHA-256 calculado en navegador (Web Crypto API), archivo nunca viaja al servidor |
| Dos registros por operación | Sí, separados | Hash de operación + hash de archivo tienen lifecycle distintos |
| Datos públicos | Sin nombres de admins | Se muestra "Doble verificación" sin revelar quién aprobó/propuso |
| Datasets sin certificación | No se muestra nada | Ni pública ni logueado — la sección no aparece |
| Datasets existentes (78) | No retroactivo | Se certifican orgánicamente en siguiente actualización |
| Sello fundacional | Sí, una única vez | Hash del estado completo al activar v1.6 |
| verificar.html | Pública, sin login | Punto de auditoría ciudadana |
| Nonce management | Mutex/cola FIFO en blockchainService.js | Evitar colisión si dos admins aprueban simultáneamente |
| Verificación pre-sello | Consultar `getBlockNo()` antes de `put()` | Evitar gastar gas en reintentos duplicados (replicando lógica de StamperWrapper.js) |
| ABI | Versión limpia sin campos `signature` | web3.js v4 podría rechazar campos extra de Truffle |
| tipo_cambio 'actualizar' | Nuevo valor ENUM en cambios_pendientes | Distingue "marcar actualizado" de "editar metadatos" — lógica de file_hash más limpia |
| file_hash en datos_nuevos | Dentro del JSON, sin nueva columna | Viaja con el cambio pendiente hasta aprobarCambio(), patrón consistente |
| 'actualizar' en aprobarCambio() | Reutiliza lógica de UPDATE de 'editar' | Menos código, registrarActualizacion() solo mete fechas en datos_nuevos |
| Sidebar verificar.html | Agregar link en HTML de cada página | El sidebar está hardcodeado en cada .html, no generado dinámicamente |
| Keyfile en servidor | `/home/datospublicos/rpad/keystore/` en WNPower (donde corre RPAD) | El VPS solo tiene el nodo BFA Docker, no necesita el keyfile |
| nginx reverse proxy | Puerto 443 en VPS → proxy_pass a 8545 local | WNPower bloquea conexiones salientes a puertos no estándar |
| Node.js versión | v22.18.0 en WNPower | Más que suficiente para web3.js v4 (requiere ≥18) |

---

## 17. ESTADO ACTUAL Y PRÓXIMOS PASOS

### ✅ COMPLETADO
- [x] Análisis completo del sistema RPAD
- [x] Wallet BFA creada, registrada y verificada
- [x] Gas recargado en producción (1 ETH) — wallet lista para sellar
- [x] Contrato TSA2 identificado (producción + test)
- [x] ABI del contrato obtenida
- [x] Tests de conexión exitosos (7/7 en red test)
- [x] Lectura de sellos reales confirmada
- [x] Verificación de hashes confirmada
- [x] Problema POA middleware resuelto
- [x] Punto de integración mapeado (línea 498 de aprobarCambio)
- [x] Esquema de tabla blockchain_registros diseñado
- [x] **Confirmación de Roberto: nodo público NO es para producción**
- [x] **Análisis TSA v1 vs v2 — decisión: TSA2**
- [x] **VPS Contabo contratado y provisionado**
- [x] **SSH configurado en puerto 2222 (ISP bloquea 22)**
- [x] **Docker verificado (v29.2.1)**
- [x] **Nodo BFA de producción levantado y sincronizado**
- [x] **Decisión: NO sellar reportes PDF (son internos)**
- [x] **Decisión: Hash de archivo obligatorio al actualizar, opcional al crear**
- [x] **Decisión: Dos registros separados por operación (operación + archivo)**
- [x] **Decisión: Datos públicos sin nombres de admins**
- [x] **Decisión: Datasets existentes no se certifican retroactivamente**
- [x] **Diseño de verificar.html (página pública de verificación)**
- [x] **Diseño de card blockchain en dataset.html**
- [x] **Definición de tres niveles de datos (hashea / guarda / muestra)**
- [x] **Concepto de sello fundacional aprobado**
- [x] **Auditoría código fuente TSA2** — Stamper.sol, StamperWrapper.js, index.js, abi.json revisados
- [x] **Hallazgos de auditoría documentados** — nonce mutex, verificación pre-sello, chainId, web3 v1→v4
- [x] **Cotejo documento vs código real** — 13 archivos RPAD verificados contra el documento
- [x] **Decisión: tipo_cambio='actualizar'** — nuevo ENUM para distinguir de 'editar' metadatos
- [x] **Decisión: file_hash en datos_nuevos** — sin nueva columna, viaja en el JSON del cambio pendiente
- [x] **Decisión: 'actualizar' reutiliza UPDATE de 'editar'** — menos código, mismo resultado
- [x] **Decisión: sidebar verificar.html en cada HTML** — no generado dinámicamente
- [x] **Nodo BFA sincronizado** — confirmado 05/02/2026, bloque ~45,996,005, importando de a 1 bloque cada ~5s
- [x] **Esquema SQL verificado** — 10 tablas cotejadas contra controllers, ENUM 'actualizar' pendiente de migración
- [x] **Verificación sincronización nodo** — `docker logs --tail 20 bfanodo` muestra bloques consecutivos en tiempo real
- [x] **Test RPC nodo propio** — `curl` desde PowerShell devuelve bloque 0x2bdd844 (45,996,100), nodo operativo
- [x] **Keyfile desplegado en WNPower** — subido a `/home/datospublicos/rpad/keystore/`, 491 bytes, permisos 0600
- [x] **Diagnóstico conectividad WNPower → VPS** — puerto 8545 bloqueado, puertos 80/443 permitidos
- [x] **nginx reverse proxy instalado en VPS** — puerto 443 → proxy_pass 127.0.0.1:8545
- [x] **Conectividad WNPower → nodo BFA confirmada** — curl desde cPanel al puerto 443 devuelve bloque 0x2bdd938
- [x] **blockchainService.js creado y testeado** — inicializar, calcularHash, verificarHash, obtenerSello, getEstado, sellarHash
- [x] **Migraciones SQL ejecutadas** — blockchain_registros creada, ENUM 'actualizar' agregado
- [x] **web3.js v4 instalado** — v4.16.0, no requiere POA middleware (funciona directo con BFA)
- [x] **Primer sello real exitoso** — bloque 46012604 (06/02/2026)
- [x] **Integración en aprobarCambio()** — sellado post-commit no-bloqueante + file_hash
- [x] **registrarActualizacion() modificado** — tipo_cambio='actualizar', file_hash obligatorio, dropzone
- [x] **admin.js: drag & drop** — modal "Marcar como actualizado" (obligatorio) y "Nuevo Dataset" (opcional)
- [x] **Rutas /api/blockchain/* creadas** — verificar, estado, registro, dataset/:id, certificar
- [x] **verificar.html creada** — verificador por hash/archivo + registro público paginado con filtros
- [x] **dataset.html: card blockchain** — header BFA, hashes copiables, QR verificación, link BFA
- [x] **Link verificar.html en sidebar** — agregado en todas las páginas HTML
- [x] **Spec 13.6: Certificar archivo voluntario** — botón escudo en admin, endpoint POST /blockchain/certificar
- [x] **QR en card blockchain** — qrcode-generator v1.4.4 (CDN), SVG inline 120x120px
- [x] **Link "Ver en BFA"** — bfa.escribanodigital.ar con hash sin 0x
- [x] **Hash archivo usa file_hash** — no hash_sellado, semánticamente correcto
- [x] **Fix formato 24h** — hour12: false en verificar.html y dashboard.js
- [x] **Test flujo completo "Marcar actualizado"** — cambio pendiente → aprobar → 2 registros blockchain (cambio_dataset bloque 46023324 + certificacion_archivo bloque 46023325), ambos confirmados

### 🔄 EN PROGRESO
- (nada actualmente)

### 📋 PENDIENTE (en orden)
1. ~~**Copiar keyfile al VPS**~~ → ✅ Subido a WNPower
2. ~~**Probar RPC del nodo propio**~~ → ✅ Responde via nginx proxy
3. ~~**Migraciones SQL**~~ → ✅ Ejecutadas
4. ~~**Crear `blockchainService.js`**~~ → ✅ Creado y testeado
5. ~~**Probar stamp real**~~ → ✅ Primer sello bloque 46012604
6. ~~**Integrar en `aprobarCambio()`**~~ → ✅ Sellado post-commit + file_hash
7. ~~**Modificar `datasetController.js`**~~ → ✅ tipo_cambio='actualizar', file_hash obligatorio
8. ~~**Modificar `admin.js`**~~ → ✅ Drag & drop en ambos modales
9. ~~**Crear botón "Certificar archivo"**~~ → ✅ Spec 13.6 implementada
10. ~~**Crear rutas `/api/blockchain/*`**~~ → ✅ verificar, estado, registro, dataset, certificar
11. ~~**Crear `verificar.html`**~~ → ✅ Verificador + registro público
12. ~~**Modificar `dataset.html`**~~ → ✅ Card blockchain con QR y link BFA
13. ~~**Agregar link verificar.html al sidebar**~~ → ✅ En todas las páginas
14. **Crear sistema de reintentos** — cola para sellos fallidos con backoff
15. **Ejecutar sello fundacional** — script one-time al activar v1.6
16. **Testing end-to-end en producción (WNPower)** — deploy + flujo completo
17. **Presentar PoC funcionando a municipalidad** — solicitar aprobación presupuestaria

### ⚠️ NOTAS OPERATIVAS
- El nodo propio se reinicia automáticamente si se cae (Docker restart policy)
- Para reconectarse al VPS: `ssh root@167.86.71.102 -p 2222`
- wget en el VPS necesita `-4` para forzar IPv4 (IPv6 falla contra gitlab.bfa.ar)
- El VPS se pagó €7 de bolsillo de Mariano como PoC. Si funciona, se presenta a la municipalidad para aprobación presupuestaria formal (€5.60/mes con plan anual ≈ $75 USD/año)

### 🛡️ RESILIENCIA: ¿Qué pasa si BFA se cae?
RPAD sigue funcionando sin ningún problema. El sellado blockchain es **no bloqueante**:
```
1. Usuario propone cambio
2. Revisor aprueba
3. INSERT/UPDATE en MariaDB
4. commit() ← el cambio YA ESTÁ HECHO y es definitivo
5. Se intenta sellar en blockchain...
   ├─ BFA funciona → se sella, se guarda tx_hash ✅
   └─ BFA caída → se atrapa el error, se guarda como 'pendiente' en blockchain_registros
6. res.json({ success: true }) ← el usuario ve "Cambio aprobado"

Los sellos pendientes se reintentan automáticamente cuando BFA vuelve (cola con backoff).
La BD MariaDB es la "verdad operativa". La blockchain es la "prueba inmutable pública".
Si la blockchain se cae, la operación municipal no se interrumpe.
```

---

## 18. LECCIONES APRENDIDAS

1. **Nodo público BFA no es para producción** — documentación no lo aclara, Roberto lo confirmó en Telegram
2. **TSA API v1 también necesita nodo** — no es una solución mágica, es solo un wrapper REST sobre web3
3. **Sellos con API pública usan wallet de BFA** — no ideal para trazabilidad municipal, mejor wallet propia
4. **Docker simplifica todo** — instalar nodo BFA es literalmente un comando (`bash start.sh latest`)
5. **VPS autogestionado es necesario** — WNPower (hosting actual) no permite instalar Docker
6. **ISP de Comodoro bloquea puerto 22** — solución: cambiar SSH a puerto 2222
7. **IPv6 falla contra gitlab.bfa.ar** — usar `wget -4` para forzar IPv4
8. **Contabo excelente relación precio/specs** — 12GB RAM + 200GB SSD por €5.60/mes (anual)
9. **VNC de Contabo salvó el diagnóstico** — cuando SSH no andaba, VNC permitió entrar y diagnosticar
10. **Estrategia PoC efectiva** — pagar de bolsillo, probar, y presentar funcionando a la municipalidad
11. **Código original TSA2 usa web3.js v1** — nuestro blockchainService.js usa v4, hay diferencias de API (BigInt, getChainId, etc.)
12. **El contrato `put()` no verifica duplicados** — la verificación la hace el wrapper antes de enviar; debemos replicar esa lógica
13. **Nonce local sin mutex es peligroso** — el código original funciona porque la API TSA2 es secuencial, pero RPAD puede tener aprobaciones concurrentes
14. **`getBlockNo()` solo devuelve el primer sello** — para historial completo usar `getObjectCount()` + `getObjectPos()` + `getStamplistPos()`
15. **ABI de Truffle agrega campos `signature`** — usar ABI limpia para evitar problemas con web3.js v4
16. **`registrarActualizacion()` usaba tipo_cambio='editar'** — semánticamente incorrecto, creado `'actualizar'` para distinguir
17. **El sidebar está hardcodeado en cada HTML** — no se genera desde main.js; agregar links nuevos requiere tocar ~10 archivos
18. **file_hash debe viajar en datos_nuevos** — no crear nueva columna; el JSON de cambios_pendientes ya es el "paquete" natural entre propuesta y aprobación
19. **Keyfile va en WNPower, no en VPS** — blockchainService.js corre como parte de RPAD en WNPower y se conecta al nodo BFA remotamente; el VPS solo ejecuta Docker
20. **`historial_actualizaciones` es tabla zombie** — existe en la BD pero no la usa ningún controller desde v1.5; fue reemplazada por cambios_pendientes
21. **`datos_nuevos` tiene CHECK JSON constraint** — MariaDB valida que sea JSON válido; meter file_hash ahí es compatible
22. **WNPower bloquea puertos no estándar** — hosting compartido no permite conexiones salientes al puerto 8545; solución: nginx proxy en puerto 443
23. **"Connection refused" ≠ bloqueado** — "refused" significa que el paquete llegó pero no hay servicio escuchando; "timeout" sería bloqueado
24. **Node.js en cPanel no es `node` en terminal** — `node --version` da "command not found" en SSH de cPanel, pero la versión se ve en el panel de Node.js (v22.18.0)

---

## 19. ARCHIVOS QUE DEBE SUBIR EL USUARIO A LA NUEVA CONVERSACIÓN

Para que Claude pueda implementar directamente, subir estos archivos del proyecto RPAD:

**Imprescindibles:**
1. `cambiosPendientesController.js` — Archivo a modificar (punto de integración blockchain)
2. `datasetController.js` — Archivo a modificar (recibir file_hash en registrarActualizacion)
3. `database.js` — Para seguir el patrón de conexión
4. `app.js` — Para agregar las nuevas rutas
5. `routes/index.js` — Para agregar rutas de blockchain
6. Este documento (`RPAD_BFA_Resumen_Proyecto.md`)

**Frontend (necesarios para modificar):**
7. `admin.js` — Para agregar drag & drop de archivo y botón "Certificar archivo"
8. `admin.html` — Para agregar modales, botón, y link a verificar.html en sidebar
9. `dataset.html` — Para agregar card de certificación y link a verificar.html en sidebar
10. `dataset-detail.js` — Para cargar datos de blockchain
11. `api.js` — Para agregar métodos de blockchain
12. `main.js` — Para contexto de sidebar visibility y layout global

**Nota sidebar:** El sidebar está hardcodeado en cada página HTML (no generado desde main.js). Para agregar el link a verificar.html hay que modificar ~10 archivos HTML. main.js solo controla visibilidad de secciones.

**Opcionales (útiles para contexto):**
13. `datospublicos_mcr_rpad.sql` — Esquema completo de BD
14. `config.js` — Configuración frontend
15. `auth.js` (frontend) — Para headers de autenticación

**Antes de la nueva conversación, verificar:**
- [x] Nodo BFA sincronizado — ✅ confirmado 05/02/2026, bloque ~45,996,005
- [x] RPC responde — ✅ confirmado via nginx proxy, puerto 443
- [x] Keyfile subido a WNPower — ✅ en `/home/datospublicos/rpad/keystore/`, permisos 0600
- [x] Conectividad WNPower → VPS — ✅ confirmada via puerto 443 (nginx proxy)
