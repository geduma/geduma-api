# Geduma Auth — Guía de Integración para Apps

Esta guía describe cómo cualquier aplicación (web, mobile, desktop) puede
implementar login OAuth centralizado a través de Geduma API. La app solo
necesita hacer 3 llamadas HTTP.

---

## Arquitectura General

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Tu App      │     │  Geduma API     │     │  Provider    │
│  (frontend)  │     │  /geduma-auth   │     │  (Google/    │
│              │     │                 │     │   GitHub/MS) │
└──────┬───────┘     └────────┬────────┘     └──────┬───────┘
       │                      │                     │
       │ ① GET /auth/providers/{appId}              │
       │ ← [{ providerId, name, displayName, icon }]│
       │                      │                     │
       │ (render buttons)     │                     │
       │                      │                     │
        │ ② POST /auth/login/{appId}/{providerId}    │
        │    (sin body)         │                     │
        │ ← { redirect: "https://..." }             │
       │                      │                     │
       │ ── redirect user ────────────────────────→│
       │                      │                     │
       │                      │ ← callback to /auth │
       │                      │   ?code=&state=     │
       │                      │                     │
       │ <── redirect to ──── │                     │
       │  redirect_url?       │                     │
       │  session_token=xxx   │                     │
       │                      │                     │
       │ ③ GET /auth/session/{sessionToken}         │
       │ ← { email, displayName, picture, rawData } │
       │    (session deleted) │                     │
```

---

## Requisitos Previos

1. La app debe estar registrada en MongoDB (colección `apps`), con un `appId` único
2. La app debe tener relaciones activas en `app-providers` con los providers deseados
3. Geduma API debe estar desplegada y accesible con `API_BASE_URL` configurado

### Registro de app

```javascript
// Ejecutar en MongoSH
function generateAppId () {
  return 'app_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const miAppId = generateAppId()
print('GUARDA ESTE VALOR:', miAppId)

db.apps.insertOne({ name: 'Mi App', appId: miAppId, redirectUrl: 'https://miapp.com/auth/callback', enabled: true })

// Relacionar con providers
db['app-providers'].insertMany([
  { appId: miAppId, providerId: 'prov_google', enabled: true },
  { appId: miAppId, providerId: 'prov_github', enabled: true },
  { appId: miAppId, providerId: 'prov_microsoft', enabled: true }
])
```

---

## Endpoints

### 1. Obtener providers disponibles

Obtiene los proveedores OAuth habilitados para una app específica.

```
GET {API_BASE_URL}/auth/providers/{appId}
```

**Response 200:**
```json
{
  "ok": true,
  "msg": "Success",
  "data": [
    {
      "name": "google",
      "displayName": "Google",
      "icon": "https://www.google.com/favicon.ico",
      "providerId": "prov_google"
    },
    {
      "name": "github",
      "displayName": "GitHub",
      "icon": "https://github.com/favicon.ico",
      "providerId": "prov_github"
    }
  ]
}
```

**Response 204:** Sin contenido (app sin providers habilitados, o appId inválido → mismo response por seguridad)

---

### 2. Iniciar login

Inicia el flujo OAuth con un proveedor específico. Retorna la URL de
redirección al proveedor.

```
POST {API_BASE_URL}/auth/login/{appId}/{providerId}
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `appId` | path | Hash único de la app |
| `providerId` | path | ID del provider: `prov_google`, `prov_github`, `prov_microsoft` |

> La `redirectUrl` se obtiene automáticamente de la base de datos (campo `apps.redirectUrl`).
> No se envía en el body de la petición.

**Response 200:**
```json
{
  "ok": true,
  "msg": "Success",
  "data": {
    "redirect": "https://accounts.google.com/o/oauth2/v2/auth?client_id=xxx&redirect_uri=...&scope=...&state=...&response_type=code"
  }
}
```

**Response 400:**
```json
{
  "ok": false,
  "msg": "Provider not enabled for this app",
  "data": []
}
```

El frontend debe redirigir al usuario a la URL en `data.redirect`.

---

### 3. Obtener sesión (después del callback)

Una vez que el usuario completa el login en el proveedor, Geduma API redirige
al navegador a `{redirectUrl}?session_token={uuid}` (obtenido de `apps.redirectUrl`). La app debe leer ese
`session_token` de la URL y consultar los datos del usuario.

```
GET {API_BASE_URL}/auth/session/{sessionToken}
```

**Response 200:**
```json
{
  "ok": true,
  "msg": "Success",
  "data": {
    "email": "usuario@gmail.com",
    "displayName": "Usuario Ejemplo",
    "picture": "https://lh3.googleusercontent.com/a/...",
    "provider": "google",
    "rawData": {
      "id": "12345",
      "email": "usuario@gmail.com",
      "verified_email": true,
      "name": "Usuario Ejemplo",
      "picture": "https://lh3.googleusercontent.com/a/...",
      "locale": "es"
    }
  }
}
```

**Response 404:**
```json
{
  "ok": false,
  "msg": "Session not found or expired",
  "data": []
}
```

La sesión se elimina automáticamente después de esta consulta (single-use).
Si no se consulta en 15 minutos, el TTL index de MongoDB la elimina.

---

## Implementación Paso a Paso

### 1. Renderizar botones de login

```jsx
// Ejemplo: React
import { useEffect, useState } from 'react'

const API = 'https://api.geduma.com' // o http://localhost:3000
const APP_ID = 'app_xxxxxx'          // obtenido al registrar la app

function LoginButtons () {
  const [providers, setProviders] = useState([])

  useEffect(() => {
    fetch(`${API}/auth/providers/${APP_ID}`)
      .then(res => res.ok ? res.json() : { data: [] })
      .then(json => setProviders(json.data || []))
      .catch(() => setProviders([]))
  }, [])

  const handleLogin = (providerId) => {
    fetch(`${API}/auth/login/${APP_ID}/${providerId}`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(json => {
        if (json.ok && json.data.redirect) {
          window.location.href = json.data.redirect
        }
      })
  }

  return (
    <div>
      {providers.map(p => (
        <button key={p.providerId} onClick={() => handleLogin(p.providerId)}>
          <img src={p.icon} alt="" width="20" />
          Login with {p.displayName}
        </button>
      ))}
    </div>
  )
}
```

### 2. Manejar el callback

```jsx
// Ejemplo: React — componente en la ruta /auth/callback
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const API = 'https://api.geduma.com'

function AuthCallback () {
  const [params] = useSearchParams()

  useEffect(() => {
    const sessionToken = params.get('session_token')

    if (!sessionToken) {
      console.error('No session_token received')
      return
    }

    fetch(`${API}/auth/session/${sessionToken}`)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const { email, displayName, picture, provider, rawData } = json.data
          console.log('User logged in:', { email, displayName, provider })
          // Aquí: guardar en estado global, redirigir al dashboard, etc.
        } else {
          console.error('Session error:', json.msg)
        }
      })
      .catch(err => console.error('Network error:', err))
  }, [params])

  return <div>Completing login...</div>
}
```

### 3. Flujo completo (vanilla JS)

```javascript
const API = 'https://api.geduma.com'
const APP_ID = 'app_xxxxxx'

// Paso 1: Obtener providers
async function getProviders () {
  const res = await fetch(`${API}/auth/providers/${APP_ID}`)
  if (!res.ok || res.status === 204) return []
  const json = await res.json()
  return json.data || []
}

// Paso 2: Iniciar login
async function login (providerId) {
  const res = await fetch(`${API}/auth/login/${APP_ID}/${providerId}`, {
    method: 'POST'
  })
  const json = await res.json()
  if (json.ok && json.data.redirect) {
    window.location.href = json.data.redirect
  } else {
    throw new Error(json.msg)
  }
}

// Paso 3: Procesar callback (llamar en la página /auth/callback)
async function processCallback (sessionToken) {
  const res = await fetch(`${API}/auth/session/${sessionToken}`)
  const json = await res.json()
  if (json.ok) {
    return json.data // { email, displayName, picture, provider, rawData }
  }
  throw new Error(json.msg)
}
```

---

## Manejo de Errores

| Error | Causa | Solución |
|-------|-------|----------|
| `App not found or disabled` | `appId` inválido o app deshabilitada | Verificar el `appId` en MongoDB |
| `Provider not enabled for this app` | El provider no está relacionado con la app | Agregar relación en `app-providers` |
| `Provider not found or disabled` | Provider deshabilitado en MongoDB | Verificar `enabled: true` en `providers` |
| `Invalid or expired state` | El state de OAuth expiró (5 min) o es inválido | Reiniciar el login |
| `Session not found or expired` | `sessionToken` inválido o expiró (15 min) | Reiniciar el login |

---

## Seguridad

- **`session_token` es single-use**: Se elimina de MongoDB al ser consultado.
  Una vez obtenido, no se puede consultar de nuevo.
- **State OAuth expira a los 5 min en Redis**: Previene ataques CSRF y
  reutilización de estados.
- **Sesiones no consumidas expiran a los 15 min**: TTL index de MongoDB
  limpia automáticamente los registros huérfanos.
- **Credenciales OAuth en MongoDB**: `clientId` y `clientSecret` no se
  exponen en ningún endpoint público. Solo la API los usa internamente.
- **No se requiere JWT ni API key**: El flujo es completamente público
  (sin autenticación entre app y geduma-api). La seguridad está en el
  single-use del session_token y el state OAuth.

---

## Preguntas Frecuentes

**¿Puedo probar en localhost?**
Sí. Configura `API_BASE_URL=http://localhost:3000` en `.env` y registra
`http://localhost:3000/auth` como redirect URI en cada consola de proveedor.

**¿Qué pasa si el usuario cierra el navegador antes del callback?**
La sesión temporal expira sola a los 15 min (TTL index). El usuario solo
debe reiniciar el login.

**¿Puedo usar el mismo `appId` en varios entornos (dev/staging/prod)?**
No recomendado. Crea un `appId` distinto por entorno, apuntando a la misma
instancia de geduma-api. Cada entorno tendrá su propia relación de providers.

**¿Cómo obtengo más datos del usuario?**
El campo `rawData` contiene la respuesta completa del proveedor. Revisa
ese objeto para cualquier campo adicional que necesites.
