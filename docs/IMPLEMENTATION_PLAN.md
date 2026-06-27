# Admin Dashboard + Monitoreo — Geduma API

## Resumen

Módulo de administración autoservido para monitorear en vivo todos los módulos de `geduma-api`, con detección de anomalías, alertas visuales en dashboard y notificaciones push al celular vía [ntfy.sh](https://ntfy.sh).

**0 nuevas dependencias npm.**

## Stack

| Componente | Tecnología |
|---|---|
| Storage | MongoDB (nueva instancia) + TTL index 7 días |
| Dashboard UI | HTML + vanilla JS (sin dependencias) |
| Notificaciones | ntfy.sh via `fetch` nativo |
| Config umbrales | Archivo ESM (`alerts.config.js`) |
| Superuser | Campo en `allowed_users` + script `create-superuser.js` |

## Arquitectura

```
Request → monitor.js → metricsService.log() (fire-and-forget a MongoDB)
                           ↓
Dashboard (cada 15s) → GET /admin/api/summary → metricsService.getSummary()
                           ↓
                    alertsService.evaluate() → compara métricas vs umbrales
                           ↓
                    Si ALERT nueva → notifierService.notify() → ntfy.sh → push al celular
                           ↓
                    GET /admin/api/alerts → alertas activas al dashboard
```

## Endpoints

| Método | Path | Descripción |
|---|---|---|
| `GET` | `/admin` | Dashboard HTML |
| `GET` | `/admin/api/summary` | Resumen global + métricas por módulo |
| `GET` | `/admin/api/modules/:module` | Detalle por módulo |
| `GET` | `/admin/api/errors` | Últimos 50 errores 4xx/5xx |
| `GET` | `/admin/api/alerts` | Alertas activas |

## Umbrales de alertas (configurables)

```js
export const ALERT_THRESHOLDS = {
  errorRate: { percent: 10, windowMinutes: 5, severity: 'ALERT' },
  requestSpike: { multiplier: 3, windowMinutes: 1, severity: 'WARN' },
  slowResponse: { ms: 2000, windowMinutes: 5, severity: 'ALERT' },
  authFailRate: { count: 10, windowMinutes: 1, severity: 'ALERT' },
  rateLimitHits: { count: 50, windowMinutes: 1, severity: 'WARN' },
  notFoundRate: { percent: 50, windowMinutes: 5, severity: 'WARN' },
  singleIpFlood: { count: 30, windowMinutes: 1, severity: 'ALERT' }
}
```

## Superusuario

- `allowed_users` collection de geduma-auth
- Campo nuevo: `superuser: Boolean (default: false)`
- `appId = '0'` para el registro superuser
- `allowedService.find()` busca por `(email, appId)` primero, luego fallback a `(email, '0', superuser: true)`
- Creación vía script: `node scripts/create-superuser.js <email>`

## Archivos nuevos

```
src/apis/admin-dashboard/
├── admin-dashboard.routes.js
├── config/
│   └── alerts.config.js
├── services/
│   ├── metrics.service.js
│   ├── alerts.service.js
│   └── notifier.service.js
├── models/
│   └── request-log.model.js
└── static/
    └── index.html

src/middleware/monitor.js
scripts/create-superuser.js
docs/IMPLEMENTATION_PLAN.md
```

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `.env.example` | + `ADMIN_NTFY_TOPIC` (usa la existente `GEDUMA_API_MONGODB_URI`) |
| `src/env-check.js` | + `GEDUMA_API_MONGODB_URI` |
| `src/db.config.js` | + `adminDashboardConn` |
| `src/main.router.js` | + `adminRouter(app)` |
| `src/apis/geduma-auth/models/allowed-users.model.js` | + campo `superuser` |
| `src/apis/geduma-auth/services/allowed-users.service.js` | + lógica superuser |
