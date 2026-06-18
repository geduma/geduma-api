# Geduma Auth v2 — Centralized OAuth Login

## Arquitectura

Geduma Auth funciona como orquestador de login OAuth centralizado. Cada app
registrada consulta qué providers tiene habilitados, redirige al usuario al
provider correspondiente vía geduma-api, y el callback OAuth siempre apunta a
la misma URL: `GET /auth`. El state OAuth (guardado en Redis) identifica qué
app y provider originaron la solicitud.

Las credenciales OAuth (`clientId`, `clientSecret`) son **globales por provider**
y se almacenan en MongoDB. Las URLs y scopes de cada proveedor están definidas
en `src/constants/oauth-providers.js`.

## Diagrama de flujo

```
[App]                    [Geduma API]                    [Google/GitHub/MS]
  │                           │                                │
  │  ① GET /auth/providers/:appId                              │
  │  ← [{ name, displayName, icon, providerId }]               │
  │                           │                                │
  │  ② POST /auth/login/:appId/google                          │
  │     { redirect_url: "https://miapp.com/cb" }               │
  │     → Redis.set(oauth:state:{uuid},                        │
  │         {appId, redirectUrl, provider}, EX 300)             │
  │  ← { redirect: "https://accounts.google.com/o/oauth2/..." }│
  │                           │                                │
  │  ③ User → browser redirect ──────────────────────────────→│
  │                           │                                │
  │  ④ GET /auth?code=xxx&state=uuid ←────────────────────────│
  │                           │                                │
  │  ⑤ Server:                                                │
  │     a. Redis.get(state) → { appId, redirectUrl, provider } │
  │     b. Redis.del(state)                                    │
  │     c. POST tokenUrl (code + clientId + clientSecret)      │
  │        → access_token                                      │
  │     d. GET userInfoUrl (access_token) → { email, name, ...}│
  │     e. Crea auth-session en MongoDB (single-use)           │
  │     f. Sirve index.html con script auto-redirect           │
  │  ← index.html (spinner 0.5s → redirect a la app)          │
  │                           │                                │
  │  ⑥ GET /auth/session/:sessionToken                         │
  │  ← { email, displayName, picture, provider, rawData }      │
  │     (sesión eliminada - single-use)                        │
```

## Modelos de Datos

### Colección: `providers`

Almacena las credenciales OAuth de cada proveedor (Google, GitHub, Microsoft).
Las URLs y scopes están en `src/constants/oauth-providers.js`.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Autogenerado |
| `providerId` | String (unique) | Identificador único del proveedor |
| `name` | String (unique) | Nombre interno: `"google"`, `"github"`, `"microsoft"` |
| `displayName` | String | Nombre para mostrar: `"Google"`, `"GitHub"`, `"Microsoft"` |
| `clientId` | String | OAuth Client ID |
| `clientSecret` | String | OAuth Client Secret |
| `icon` | String (opcional) | URL del ícono o emoji |
| `enabled` | Boolean | Si el proveedor está activo globalmente |
| `createdAt` | Date | Timestamps automático |
| `updatedAt` | Date | Timestamps automático |

### Colección: `apps`

Aplicaciones registradas que pueden usar geduma-auth para login.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Autogenerado |
| `name` | String | Nombre descriptivo de la app |
| `appId` | String (unique) | Hash único que identifica la app |
| `enabled` | Boolean | Si la app está activa |
| `createdAt` | Date | Timestamps automático |
| `updatedAt` | Date | Timestamps automático |

### Colección: `app-providers`

Relación muchos-a-muchos entre apps y providers. Define qué providers
tiene habilitados cada app.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Autogenerado |
| `appId` | String | Referencia a `apps.appId` |
| `providerId` | String | Referencia a `providers.providerId` |
| `enabled` | Boolean | Si la relación está activa |
| `createdAt` | Date | Timestamps automático |
| `updatedAt` | Date | Timestamps automático |

Índice compuesto único: `{ appId: 1, providerId: 1 }`

### Colección: `auth-sessions`

Sesiones temporales de login. Se crean después de un callback OAuth exitoso
y se eliminan al ser consultadas por la app (single-use). También se eliminan
automáticamente tras 15 min vía TTL index.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | ObjectId | Autogenerado |
| `sessionToken` | String (unique) | UUID de un solo uso |
| `provider` | String | Nombre del provider usado |
| `appId` | String | App que solicitó el login |
| `email` | String | Email del usuario (normalizado) |
| `displayName` | String | Nombre del usuario (normalizado) |
| `picture` | String | Foto/avatar (normalizado) |
| `rawData` | Mixed | Respuesta completa del provider (JSON) |
| `expiresAt` | Date (TTL index) | Fecha de expiración (+15 min) |
| `createdAt` | Date | Timestamps automático |

## Endpoints

| Método | Ruta | Auth | Body/Query | Respuesta |
|--------|------|------|------------|-----------|
| `GET` | `/auth` | No | Query: `?code=&state=` | HTML (carátula) o procesa callback y redirige |
| `GET` | `/auth/providers/:appId` | No | - | `{ ok, data: [{name, displayName, icon, providerId}] }` |
| `POST` | `/auth/login/:appId/:provider` | No | `{ redirect_url }` | `{ ok, data: { redirect: "https://..." } }` |
| `GET` | `/auth/session/:sessionToken` | No | - | `{ ok, data: { email, displayName, picture, provider, rawData } }` |

Los endpoints existentes `GET /auth` (original), `POST /auth` y
`POST /auth/set-provider` se mantienen sin cambios.

## Constantes

### `src/constants/oauth-providers.js`

```js
export const OAUTH_PROVIDERS = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile'
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: 'read:user'
  },
  microsoft: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scope: 'openid email profile User.Read'
  }
}
```

## Redis

- **Key**: `oauth:state:{uuid}`
- **Value**: `{ appId, redirectUrl, provider }`
- **TTL**: 300 segundos (5 minutos)
- **Propósito**: Almacenar el state OAuth entre `initiateLogin` y el callback.
  Se elimina inmediatamente al procesar el callback.
- Ya existe conexión Redis en el proyecto (Upstash), se reutiliza.

---

## MongoDB Atlas — Setup (TablePlus)

Los siguientes scripts están listos para copiar y pegar en la consola de
TablePlus (pestaña "Query") conectada a tu base de datos Atlas.

### 1. Crear colecciones con validación

```javascript
db.createCollection('providers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['providerId', 'name', 'displayName', 'clientId', 'clientSecret'],
      properties: {
        providerId: { bsonType: 'string' },
        name: { bsonType: 'string' },
        displayName: { bsonType: 'string' },
        clientId: { bsonType: 'string' },
        clientSecret: { bsonType: 'string' },
        icon: { bsonType: 'string' },
        enabled: { bsonType: 'bool' }
      }
    }
  }
})
```

```javascript
db.createCollection('apps', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'appId'],
      properties: {
        name: { bsonType: 'string' },
        appId: { bsonType: 'string' },
        enabled: { bsonType: 'bool' }
      }
    }
  }
})
```

```javascript
db.createCollection('app-providers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['appId', 'providerId'],
      properties: {
        appId: { bsonType: 'string' },
        providerId: { bsonType: 'string' },
        enabled: { bsonType: 'bool' }
      }
    }
  }
})
```

```javascript
db.createCollection('auth-sessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sessionToken', 'provider', 'email'],
      properties: {
        sessionToken: { bsonType: 'string' },
        provider: { bsonType: 'string' },
        appId: { bsonType: 'string' },
        email: { bsonType: 'string' },
        displayName: { bsonType: 'string' },
        picture: { bsonType: 'string' },
        rawData: { bsonType: 'object' },
        expiresAt: { bsonType: 'date' }
      }
    }
  }
})
```

### 2. Crear índices

```javascript
// providers
db.providers.createIndex({ providerId: 1 }, { unique: true })
db.providers.createIndex({ name: 1 }, { unique: true })

// apps
db.apps.createIndex({ appId: 1 }, { unique: true })

// app-providers
db['app-providers'].createIndex({ appId: 1, providerId: 1 }, { unique: true })
db['app-providers'].createIndex({ appId: 1 })
db['app-providers'].createIndex({ providerId: 1 })

// auth-sessions
db['auth-sessions'].createIndex({ sessionToken: 1 }, { unique: true })
db['auth-sessions'].createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

### 3. Insertar proveedores

Reemplaza los valores `clientId` y `clientSecret` con los reales de cada
proveedor (Google Cloud Console, GitHub OAuth Apps, Microsoft Entra ID).

```javascript
db.providers.insertMany([
  {
    providerId: 'prov_google',
    name: 'google',
    displayName: 'Google',
    clientId: 'TU_CLIENT_ID_GOOGLE',
    clientSecret: 'TU_CLIENT_SECRET_GOOGLE',
    icon: 'https://www.google.com/favicon.ico',
    enabled: true
  },
  {
    providerId: 'prov_github',
    name: 'github',
    displayName: 'GitHub',
    clientId: 'TU_CLIENT_ID_GITHUB',
    clientSecret: 'TU_CLIENT_SECRET_GITHUB',
    icon: 'https://github.com/favicon.ico',
    enabled: true
  },
  {
    providerId: 'prov_microsoft',
    name: 'microsoft',
    displayName: 'Microsoft',
    clientId: 'TU_CLIENT_ID_MICROSOFT',
    clientSecret: 'TU_CLIENT_SECRET_MICROSOFT',
    icon: 'https://www.microsoft.com/favicon.ico',
    enabled: true
  }
])
```

### 4. Insertar apps

```javascript
// Función auxiliar para generar appId
function generateAppId() {
  return 'app_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

db.apps.insertMany([
  {
    name: 'Mi App Web',
    appId: generateAppId(),
    enabled: true
  },
  {
    name: 'Mi App Mobile',
    appId: generateAppId(),
    enabled: true
  }
])
```

### 5. Relacionar apps con providers

```javascript
const apps = db.apps.find().toArray()
const webApp = apps.find(a => a.name === 'Mi App Web')
const mobileApp = apps.find(a => a.name === 'Mi App Mobile')

db['app-providers'].insertMany([
  // Mi App Web → Google + GitHub
  { appId: webApp.appId, providerId: 'prov_google', enabled: true },
  { appId: webApp.appId, providerId: 'prov_github', enabled: true },
  // Mi App Mobile → Google + Microsoft
  { appId: mobileApp.appId, providerId: 'prov_google', enabled: true },
  { appId: mobileApp.appId, providerId: 'prov_microsoft', enabled: true }
])
```

### 6. Verificar

```javascript
// Ver proveedores
db.providers.find().pretty()

// Ver apps
db.apps.find().pretty()

// Ver relaciones
db['app-providers'].find().pretty()

// Ver índices
db.providers.getIndexes()
db.apps.getIndexes()
db['app-providers'].getIndexes()
db['auth-sessions'].getIndexes()
```

### Notas importantes

- **`expiresAt`**: Al insertar un `auth-session` desde código, el valor será
  `new Date(Date.now() + 15 * 60 * 1000)`. El TTL index lo elimina automáticamente.
- **`redirect_uri` en proveedores OAuth**: En cada consola de proveedor
  (Google Cloud, GitHub OAuth, Microsoft Entra), configurar como
  `https://tu-dominio-api.com/auth`. Siempre la misma URL.
- **`appId` se genera en el código** con un hash. Los ejemplos aquí usan
  `generateAppId()` para simularlo, pero en producción la app se crea
  manualmente en la DB y se le asigna un hash único.
