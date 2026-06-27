# Integración de nuevos módulos al monitoreo

Al agregar un nuevo módulo a `src/apis/`, se debe registrar en dos lugares para que aparezca correctamente en el dashboard.

## 1. Registrar en `src/middleware/monitor.js`

Agregar el nombre del módulo al array `KNOWN_MODULES`:

```js
const KNOWN_MODULES = ['auth', 'config-manager', 'short-url', 'snippet-vault', 'screenshot-backup', 'gnotes', 'gpass', 'nuevo-modulo']
```

Esto asegura que los requests a `/{nuevo-modulo}/*` se clasifiquen con ese nombre en lugar de caer en `root`.

## 2. Registrar en `src/main.router.js`

Si el módulo expone rutas, se importa y registra igual que los demás:

```js
import { nuevoModuloRouter } from './apis/nuevo-modulo/nuevo-modulo.routes.js'

export function router (app) {
  nuevoModuloRouter(app)
  // ...
}
```

## 3. MongoDB

No se requiere ninguna configuración adicional. El modelo `request-log.model.js` almacena el nombre del módulo como string sin schema fijo. La colección `request_logs` se auto-crea al primer request.

## 4. Dashboard

El dashboard muestra automáticamente cualquier módulo que aparezca en los logs de los últimos 5 minutos. No requiere cambios en el HTML ni en los endpoints.
