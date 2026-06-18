# Geduma Auth — Configuración de Proveedores OAuth

Las credenciales OAuth (`clientId`, `clientSecret`) se almacenan en MongoDB,
colección `providers`. Las URLs y scopes están hardcodeadas en
`src/constants/oauth-providers.js`.

La **redirect URI** es la **misma para todos los proveedores**:
`https://{API_BASE_URL}/auth`. Esto centraliza el callback en geduma-api
y nunca necesitas cambiar esta configuración aunque agregues nuevas apps.

---

## Google

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear un proyecto o seleccionar uno existente
3. Ir a **APIs & Services → Credentials**
4. Click **+ Create Credentials → OAuth client ID**
5. Si es primera vez, configurar la pantalla de consentimiento:
   - **User type**: External
   - **App name**: `Geduma Auth`
   - **Authorized domains**: `localhost` (dev) o tu dominio
   - **Scopes**: agregar `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
   - **Test users**: agregar tu email
6. Crear OAuth client:
   - **Application type**: Web application
   - **Name**: `Geduma Auth`
   - **Authorized JavaScript origins**: `http://localhost:3000` (dev) o `https://tu-dominio.com`
   - **Authorized redirect URIs**: `http://localhost:3000/auth` (dev) o `https://tu-dominio.com/auth`
7. Copiar **Client ID** y **Client Secret**

```javascript
db.providers.updateOne(
  { providerId: 'prov_google' },
  { $set: { clientId: 'CLIENT_ID', clientSecret: 'CLIENT_SECRET' } }
)
```

---

## GitHub

1. Ir a **Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Registrar:
   - **Application name**: `Geduma Auth`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth`
3. Click **Register application**
4. Copiar **Client ID**
5. Click **Generate a new client secret** y copiar el **Client Secret**

```javascript
db.providers.updateOne(
  { providerId: 'prov_github' },
  { $set: { clientId: 'CLIENT_ID', clientSecret: 'CLIENT_SECRET' } }
)
```

---

## Microsoft (Entra ID)

1. Ir a [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/)
2. Click **New registration**
3. Registrar:
   - **Name**: `Geduma Auth`
   - **Supported account types**: `Accounts in any organizational directory and personal Microsoft accounts`
   - **Redirect URI**: Web → `http://localhost:3000/auth`
4. Click **Register**
5. Copiar **Application (client) ID**
6. Ir a **Certificates & secrets → New client secret** → copiar valor
7. Ir a **API permissions → Add a permission → Microsoft Graph → Delegated permissions**
   Agregar: `email`, `openid`, `profile`, `User.Read`
8. Click **Grant admin consent** (si aplica)

```javascript
db.providers.updateOne(
  { providerId: 'prov_microsoft' },
  { $set: { clientId: 'CLIENT_ID', clientSecret: 'CLIENT_SECRET' } }
)
```

---

## Verificar configuración

```javascript
db.providers.find({}, { providerId: 1, name: 1, clientId: 1, enabled: 1 })
```

Cada proveedor debe mostrar su `clientId` y `enabled: true`.
