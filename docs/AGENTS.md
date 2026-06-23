# AGENTS — Geduma API

## Project Overview

Modular monolith backend API with 7 modules (Config Manager, Geduma Auth, Short URL, Snippet Vault, Screenshot Backup, Gnotes, Gpass). Built with Express + Mongoose + JWT + Upstash Redis.

---

## Dev Setup

```bash
cp .env.example .env   # fill in real values
npm install
npm run dev            # nodemon (hot reload)
npm start              # production
```

## Linting & Testing

Uses **standard** (`.eslintConfig` in package.json extends `standard/eslintrc.json`).

```bash
npx standard --fix src/   # lint src/
npx standard --global afterEach --global describe --global it --global expect --global vi --global beforeEach test/   # lint test/
npm test                  # vitest run
```

---

## Project Structure

```
index.js                       # Entry: Express app, middleware, routes, cron
src/
├── main.router.js             # Aggregates all 7 module routers + health + 404
├── db.config.js               # 7 Mongoose connections (conn.{authConn, configManagerConn, ...})
├── env-check.js               # Validates required env vars at startup
├── constants/
│   ├── constants.js           # HTML templates, AUTH_PROVIDERS list
│   └── endpoints.js           # External URLs (GitHub OAuth, Telegram API, Geduma Auth)
├── middleware/
│   ├── errorHandler.js        # Express error handler (4-arg)
│   ├── validate.js            # Joi-like schema validation factory
│   └── rateLimiter.js         # Shared rate limiter factory (global/read/write)
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
    ├── screenshot-backup/     # routes + services/ + model (archives)
    ├── gnotes/                # routes + service + model (gnotes)
    └── gpass/                 # routes + service + model (passwords, blind storage)
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

### Rate limiting layers
All modules use 3-tier rate limiting from `src/middleware/rateLimiter.js`:

1. **Global** (120 req/min per IP) — all endpoints
2. **Read** (60 req/min per owner+IP) — GET endpoints
3. **Write** (30 req/min per owner+IP) — POST/PUT/DELETE endpoints

Exceptions: modules without owner fall back to IP-only keying; short-url GET has 120 req/min (public redirects); geduma-auth login/auth have 15 req/min.

### Authentication layers
- **No auth:** config-manager (all endpoints), health checks, snippet-vault (all endpoints), short-url GET, auth endpoints.
- **JWT required:** short-url POST routes, screenshot-backup summary, gnotes (all endpoints), gpass (all endpoints).

To add auth to a route:
```js
app.post(`${path}/something`, security.verify, handler)
```

`security.verify` decodes JWT from `Authorization` header, checks Redis, deletes token (single-use), then calls `next()`.

### Database connections
`db.config.js` creates 7 separate Mongoose connections. Each model imports its connection:
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
- **`async/await`** for all async operations (no legacy `new Promise`).
- **`dotenv.config()`** in `index.js`, `db.config.js`, and `security.interceptor.js` (needed because ESM imports resolve before `index.js` executes).
- **No TypeScript** — plain JS.
- **Tests** in `test/` directory using Vitest. Run with `npm test`.

---

## Known Issues to Be Aware Of

1. **Commented-out auth** on `POST /auth/set-provider`: `security.verify` is commented.
2. **Hardcoded `?id=12345`** in `geduma-auth.routes.js:12`.
3. **Config Manager has `null` API key/secret** — `security.auth()` will always reject.
4. **`tags` is stored as comma-separated String** in `snippets` model — not queryable by individual tag.
5. **Gpass blind storage** — `password`, `encrypted`, `iv` are never inspected by the server.

---

## Editing Guidelines

When modifying code:
1. Read existing patterns in the same file / neighboring files first.
2. Keep the `generalResponse` wrapper for all API responses.
3. Use the existing connection from `db.config.js` for any new model.
4. If adding a new module, follow the `routes + service + model` structure and register it in `main.router.js`.
5. Import paths are relative (no path aliases).
6. Run `npm run lint` and `npm test` after changes to stay clean.
7. When adding endpoints, document them in PRD.md.
