# Evaluación de Seguridad — Módulo Gpass

**Fecha:** 2026-06-23  
**Alcance:** `src/apis/gpass/` + `security.interceptor.js`

---

## Resumen

| Categoría | Hallazgos | Severidad |
|-----------|-----------|-----------|
| Autenticación | 2 | Medio |
| Autorización | 1 | Bajo |
| Validación de entrada | 2 | Alto |
| Exposición de datos | 0 | — |
| Infraestructura | 2 | Medio |

---

## Hallazgos

### 1. [ALTO] Sin validación de body en POST/PUT

**Archivo:** `gpass.routes.js:45-52` y `gpass.service.js:34-36`

`create()` pasa `req.body` directamente a Mongoose, y `update()` tiene un allowlist manual pero no valida tipos. No hay middleware de validación (Joi, express-validator) como el existente en `src/middleware/validate.js`.

**Riesgo:** Un cliente puede enviar tipos inválidos (ej: `strength: 123`), campos extras, o datos malformados que causen errores 500.

**Reproducción:** `POST /gpass` con `{ title: 123, ... }` — Mongoose lanza error de validación, capturado como 500 con mensaje interno expuesto.

---

### 2. [ALTO] `$regex` injection en `?q`

**Archivo:** `gpass.service.js:16`

```js
filter.title = { $regex: q, $options: 'i' }
```

`q` viene del query param sin sanitizar. Un atacante puede inyectar una regex maliciosa tipo ReDoS.

**Riesgo:** Query como `?q=((a+)+)+b` puede causar backtracking exponencial en MongoDB, degradando o colgando el servidor.

**Mitigación:** Escapar caracteres especiales de regex antes de pasarlos a `$regex`.

---

### 3. [MEDIO] Owner viaja como query param sin cifrar

**Archivo:** `gpass.routes.js:23`

```js
const owner = req.query.owner
```

**Riesgo:** `owner` queda visible en logs de servidor (morgan), logs de CDN/proxy, referrer headers, historial del navegador.

**Mitigación:** Mover owner a header (`X-Owner`) o extraerlo del JWT.

---

### 4. [MEDIO] Error messages expuestos al cliente

**Archivo:** `gpass.routes.js:30, 42, 50, 58, 70`

```js
res.status(err.statusCode || 500).send(generalResponse.error(err.message))
```

**Riesgo:** Fuga de información interna (nombres de DB, stack traces parciales, detalles del driver MongoDB).

**Mitigación:** En producción, no exponer `err.message` en 500s; devolver mensaje genérico y loggear el detalle.

---

### 5. [MEDIO] Mass assignment en `create()`

**Archivo:** `gpass.service.js:34-36`

```js
const create = (data) => gpassModel.create(data)
```

**Riesgo:** Si en el futuro se agregan campos sensibles al schema (ej: `role`, `isAdmin`), un cliente podría enviarlos. `update()` tiene allowlist, `create()` no.

---

### 6. [BAJO] JWT path resolution frágil

**Archivo:** `security.interceptor.js:44`

```js
apiSecret: apiSecrets[req.path.split('/')[1]]
```

**Riesgo:** Cambios en el path prefix romperían la autenticación silenciosamente (401 permanente).

---

### 7. [BAJO] Sin validación de `:id` como ObjectId

**Archivo:** `gpass.service.js:29-31`

```js
const getById = (id, owner) => gpassModel.findOne({ _id: id, owner })
```

**Riesgo:** ID inválido → `CastError` → 500 con mensaje interno.

**Reproducción:** `GET /gpass/invalid-id?owner=x`

---

### 8. [BAJO] Sin HTTPS enforcement en la app

La app no redirige HTTP → HTTPS. Depende del reverse proxy.

**Riesgo:** Si alguien golpea el servidor directamente por HTTP, tokens JWT y datos viajan en texto plano.

---

## Puntos Fuertes (lo que está bien)

| Aspecto | Estado |
|---------|--------|
| **Autenticación JWT single-use** | ✅ Token se elimina de Redis tras uso |
| **CORS restringido** | ✅ Solo `https://gpass.geduma.com` |
| **Rate limiting** | ✅ 50 req/15min en el path |
| **Ownership en PUT/DELETE** | ✅ Verifica `doc.owner === owner` antes de mutar |
| **Allowlist de campos en update** | ✅ Solo `allowed` se actualizan |
| **Blind storage** | ✅ `password`, `encrypted`, `iv` no se inspeccionan |
| **Enum en strength** | ✅ Mongoose valida contra `['strong', 'medium', 'weak']` |
| **Timestamps automáticos** | ✅ Sin riesgo de manipulación de fechas por el cliente |

---

## Recomendaciones Prioritarias

1. **Sanitizar `?q`** — Escapar caracteres especiales de regex antes de pasarlo a `$regex`:

```js
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
```

2. **Validar body con Joi** — Usar el middleware `validate.js` ya existente. Tener schemas separados para POST y PUT.

3. **Validar ObjectId** — Usar `mongoose.Types.ObjectId.isValid(id)` antes de consultar; devolver 400 si no es válido.

4. **Manejo de errores en producción** — No exponer `err.message` en 500s. Loggear el error real y devolver mensaje genérico.

5. **Mover owner del query param a header o JWT** — Para evitar exposición en logs/URLs.
