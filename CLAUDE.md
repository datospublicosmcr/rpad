# RPAD — Registro Provincial de Activos de Datos
# Municipalidad de Comodoro Rivadavia

## Resumen del proyecto
Sistema web para gestionar el catálogo de datos abiertos del municipio.
Versión actual: 1.5. Integrando certificación blockchain via BFA (Blockchain Federal Argentina).
IMPORTANTE: Para contexto completo, ABI del contrato, estructura de datosParaSellar, specs de módulos (secciones 13.1-13.7), decisiones técnicas y lecciones aprendidas, leer RPAD_BFA_Resumen_Proyecto.md en la raíz del proyecto. Ese documento es la fuente de verdad.

## Stack técnico
- Backend: Node.js v22 + Express.js (ES Modules)
- Base de datos: MariaDB (mysql2/promise)
- Frontend: HTML + CSS + JS vanilla (Lucide icons), sin framework
- Autenticación: JWT
- Puerto: 3001
- Servidor producción: WNPower (hosting compartido)
- VPS desarrollo: Contabo (167.86.71.102) — nodo BFA + proxy nginx

## Estructura del proyecto
- /controllers/ — Lógica de negocio
  - cambiosPendientesController.js — PUNTO DE INTEGRACIÓN blockchain
  - datasetController.js — CRUD datasets
  - reportesController.js — Generación PDFs
- /routes/ — Rutas Express
- /public/ — Archivos estáticos (HTML público, CSS, JS cliente)
- /config/ — Configuración de BD y app
- /middleware/ — Autenticación y permisos
- /database/schema.sql — Esquema de la BD

## Comandos
- Instalar dependencias: npm install
- Iniciar servidor: npm start o node server.js
- No hay tests automatizados

## Base de datos (MariaDB)
- 11 tablas (10 originales + blockchain_registros)
- Tablas clave: datasets, cambios_pendientes, usuarios, areas
- blockchain_registros ya creada en dev
- datos_nuevos en cambios_pendientes tiene CHECK constraint JSON valid
- historial_actualizaciones está obsoleta (NO usar)
- ENUM tipo_cambio incluye crear/editar/eliminar/actualizar

## Integración Blockchain (en desarrollo — v1.6)
- Red: BFA Producción (Chain ID: 200941592)
- Nodo propio: Docker en este VPS (sincronizado, 45M+ bloques)
- Conexión desde dev: http://127.0.0.1:8545 (directo al nodo Docker)
- Conexión desde producción: http://167.86.71.102:443 (via nginx proxy)
- Contrato TSA2: 0x7e56220069CAaF8367EA42817EA9210296AeC7c6
- Wallet municipal: 0x53c4D8cb6f5Fb6BaFC3b158ae582a8Fb18dCc1C9
- Librería: web3.js v4
- Balance: 1 ETH (recargado por Gas Distillery)

## Flujo de doble verificación
1. Operador propone cambio -> INSERT en cambios_pendientes
2. Segundo usuario aprueba -> se ejecuta cambio en datasets
3. NUEVO (v1.6): Después del commit() en aprobarCambio(), sellar en blockchain

## Qué se sella en blockchain
- Hash de operación: cambios aprobados (crear/editar/actualizar/eliminar)
- Hash de archivo: obligatorio en actualizar, opcional en crear
- Sello fundacional: hash del estado completo (una vez)
- NO se sella: reportes PDF, cambios rechazados, pendientes

## Tipos en blockchain_registros
- cambio_dataset, certificacion_archivo, sello_fundacional

## Contrato TSA2 — Funciones principales
- put(bytes32[]) — sella hashes
- getObjectCount(bytes32) — cuántas veces se selló
- getBlockNo(bytes32, address) — en qué bloque

## Reglas de código
- ES Modules (import/export)
- Respetar estilo existente
- Comentarios en español
- Blockchain en archivos separados: services/blockchainService.js, controllers/blockchainController.js, public/verificar.html
- Commits en español, formato "tipo: descripción"
- No commitear credenciales ni keyfiles
