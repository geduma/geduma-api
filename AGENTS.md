# AGENTS — Geduma API

## Project Overview

Modular monolith backend API with 5 modules (Config Manager, Geduma Auth, Short URL, Snippet Vault, Screenshot Backup). Built with Express + Mongoose + JWT + Upstash Redis.

---

## Dev Setup

```bash
cp .env.example .env   # fill in real values
npm install
npm run dev            # nodemon (hot reload)
npm start              # production
```

## Linting

Uses **standard** (`.eslintConfig` in package.json extends `standard/eslintrc.json`).

```bash
npx standard --fix src/
```

No test framework exists yet.

---

## Project Structure

```
index.js                       # Entry: Express app, middleware, routes, cron
src/
├── main.router.js             # Aggregates all 5 module routers + health + 404
├── db.config.js               # 5 Mongoose connections (conn.{authConn, configManagerConn, ...})
├── env-check.js               # Validates required env vars at startup
├── constants/
│   ├── constants.js           # HTML templates, AUTH_PROVIDERS list
│   └── endpoints.js           # External URLs (GitHub OAuth, Telegram API, Geduma Auth)
├── interceptors/
│   └── security.interceptor.js # auth() → JWT gen, verify() → JWT middleware, cleanOldTokens()
├── jobs/
│   └── index.js               # node-cron: flush Redis daily at midnight
├── utils/
│   ├── generalResponse.js     # { ok, msg, data } response helpers
│   ├── imageUrlToBase64.js    # fetch → Sharp WebP(70) → base64 data URI
│   └── screenShotReport.js    # archives array → HTML table report
└── apis/
    ├── geduma-auth/           # routes + service + model (auth-provider)
    ├── config-manager/        # routes + service + model (configurations)
    ├── short-url/             # routes + service + model (custom-urls)
    ├── snippet-vault/         # routes + service + model (snippets)
    └── screenshot-backup/     # routes + services/ + model (archives)
```

## Architecture Rules

### Module pattern
Each module follows: `routes.js` → `services/*.js` → `models/*.js`.

- Routes define Express endpoints and call service methods.
- Services contain business logic.
- Models are Mongoose schemas bound to the module's dedicated connection.

### Router registration
`main.router.js` imports each `*Router` function and calls it with the `app` instance:

```js
router(app)   // app.get / app.post / etc. with path prefix
```

### Response format
Always use `generalResponse.{ok|info|error}()` for consistency:

```js
generalResponse.ok(data)    // { ok: true,  msg: 'Success', data }
generalResponse.info(msg,d) // { ok: false, msg,           data }
generalResponse.error(msg)  // { ok: false, msg,           data: [] }
```

Empty result sets return **204 No Content** via `res.status(204)` before `res.send(...)`.

### Authentication layers
- **No auth:** config-manager (all endpoints), health checks, snippet-vault/all, short-url GET, auth endpoints.
- **JWT required:** short-url POST routes, screenshot-backup summary.

To add auth to a route:
```js
app.post(`${path}/something`, security.verify, handler)
```

`security.verify` decodes JWT from `Authorization` header, checks Redis, deletes token (single-use), then calls `next()`.

### Database connections
`db.config.js` creates 5 separate Mongoose connections. Each model imports its connection:
```js
import { conn } from '../../../db.config.js'
export default conn.snippetVaultConn.model('snippets', schema)
```

---

## Coding Conventions

- **ES Modules** (`"type": "module"` in package.json) — use `import`/`export`.
- **No semicolons** (Standard style; let Prettier handle it if added later).
- **`camelCase`** for variables and functions.
- **Arrow functions** preferred over `function` keyword.
- **`new Promise((resolve, reject) => {...})`** pattern for async services (legacy; avoid adding new ones — prefer `async/await` for new code).
- **`dotenv.config()`** is called in `index.js` and also in `db.config.js` and `security.interceptor.js` (redundant but harmless).
- **No TypeScript** — plain JS.
- **No tests** — add tests in `__tests__/` if introduced.

---

## Known Issues to Be Aware Of

1. **sendMessage bug** in `telegram.service.js:59`: `body` is not `JSON.stringify()`'d.
2. **Missing env var** `GEDUMA_AUTH_MONGODB_URI` not checked in `env-check.js`.
3. **Commented-out auth** on `POST /auth/set-provider`: `security.verify` is commented.
4. **Hardcoded `?id=12345`** in `geduma-auth.routes.js:12`.
5. **Config Manager has `null` API key/secret** — `security.auth()` will always reject.
6. **Double slash import** `'..//interceptors/...'` in `src/jobs/index.js:2`.

---

## Editing Guidelines

When modifying code:
1. Read existing patterns in the same file / neighboring files first.
2. Keep the `generalResponse` wrapper for all API responses.
3. Use the existing connection from `db.config.js` for any new model.
4. If adding a new module, follow the `routes + service + model` structure and register it in `main.router.js`.
5. Import paths are relative (no path aliases).
6. Run `npx standard --fix src/` after changes to stay lint-clean.
