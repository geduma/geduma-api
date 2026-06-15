# PRD: Geduma API

**Version:** 0.0.1  
**Status:** Draft  
**Last Updated:** 2026-06-15  

---

## 1. Product Overview

Geduma API is a modular monolith backend that exposes five microservice-style API modules under a single Express.js application. It serves as the server-side infrastructure for the Geduma ecosystem of tools and services.

**Production URL:** `https://api.geduma.com`

---

## 2. Goals & Objectives

- Provide a unified authentication layer (JWT + Redis) across all API modules.
- Offer self-service configuration management for internal applications.
- Enable URL shortening for sharing and redirection use cases.
- Host a snippet vault for storing and retrieving reusable code blocks.
- Provide a screenshot backup service via Telegram bot integration.
- Maintain five isolated MongoDB databases (one per module) for data separation.
- Keep the system simple to deploy: single process, no container orchestration required.

---

## 3. Modules

### 3.1 Config Manager

**Purpose:** Hierarchical key-value configuration store organized by `owner > schema > name`. Serves dynamic configuration to other applications.

**Endpoints:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/config-manager/` | No | Health check |
| GET | `/config-manager/all` | No | Returns all configurations |
| GET | `/config-manager/owner/:owner` | No | Filtered by owner |
| GET | `/config-manager/schema/:owner/:schema` | No | Filtered by owner + schema |
| GET | `/config-manager/name/:owner/:schema/:name` | No | Filtered by owner + schema + name |

**Response format (all):** `{ ok, msg, data }` via `generalResponse`.
**Empty sets** return HTTP 204 No Content.

**Model:** `configurations`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| owner | String | Yes | Top-level grouping |
| schema | String | Yes | Second-level grouping |
| name | String | Yes | Config key |
| value | String | Yes | Config value |
| expiration | Number | Yes | Timestamp |
| key | Number | Yes | Numeric identifier |

**Database:** `CONFIG_MANAGER_MONGODB_URI` (dedicated MongoDB on Atlas)

---

### 3.2 Geduma Auth

**Purpose:** OAuth-like authentication service that generates short-lived JWTs validated via Upstash Redis. Supports Google and GitHub as external auth providers.

**Endpoints:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/auth` | No | Returns provider info + redirect URL to auth frontend |
| POST | `/auth` | No | Accepts `{ name, user, key, data }` → generates JWT via API key |
| POST | `/auth/set-provider` | No | Sets auth provider (google/github), returns redirect URL |

**Auth flow:**
1. Client sends API key + module name to `POST /auth`.
2. Server validates key, signs a JWT (5-min expiry, `jti` claim = uuid).
3. JWT `jti` is stored in Upstash Redis.
4. Protected endpoints use `security.verify()` middleware to validate JWT against Redis.
5. Token is **deleted from Redis on first use** (single-use token pattern).

**Model:** `auth-provider`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| provider | String | Yes | `google` or `github` |
| origin | String | Yes | Origin URL |
| setAt | Number | Yes | Timestamp (default: `Date.now()`) |
| token | String | Yes | UUID token |

**Database:** `GEDUMA_AUTH_MONGODB_URI` (dedicated MongoDB on Atlas)

---

### 3.3 Short URL

**Purpose:** URL shortener that generates 6-character alphanumeric short codes.

**Endpoints:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/short-url/` | No | Health check |
| GET | `/short-url/:id` | No | Lookup URL by short code |
| POST | `/short-url/short` | Yes | Create short URL (project = 'default') |
| POST | `/short-url/short-by-project` | Yes | Create short URL scoped to a project |

**Auth:** Both POST endpoints require JWT via `security.verify()` middleware.

**Short code generation:** `Math.random().toString(36).substr(2, 6)` (6 chars, alphanumeric lowercase).

**Model:** `custom-urls`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| originUrl | String | Yes | The original long URL |
| shortUrl | String | Yes | The 6-char short code |
| project | String | Yes | Grouping namespace ('default' for generic) |

**Database:** `SHORT_URL_MONGODB_URI` (dedicated MongoDB on Atlas)

---

### 3.4 Snippet Vault

**Purpose:** Code snippet storage with grouping, tagging, and GitHub OAuth integration for user login.

**Endpoints:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/snippet-vault/` | No | Health check |
| GET | `/snippet-vault/all` | No | Returns all snippets |

**Planned but not yet exposed:** GitHub OAuth routes (`authGitHub` service is implemented but not routed).

**Model:** `snippets`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| group | Number | Yes | Group/category ID |
| title | String | Yes | Snippet title |
| description | String | Yes | Snippet description |
| tags | String | No | Comma-separated tags |
| snippetValue | String | Yes | The actual code/content |

**Database:** `SNIPPET_VAULT_MONGODB_URI` (dedicated MongoDB on Atlas)

---

### 3.5 Screenshot Backup

**Purpose:** Telegram bot webhook receiver that accepts screenshots sent to a Telegram bot, compresses them to WebP (base64), stores them in MongoDB, and generates HTML summary reports.

**Endpoints:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/screenshot-backup/` | No | Health check |
| GET | `/screenshot-backup/summary/:schema` | Yes | Returns HTML report of all archives for a schema |
| POST | `/screenshot-backup/geduma/webhook` | No | Telegram bot webhook receiver |

**Webhook flow:**
1. Telegram sends message with photo to webhook endpoint.
2. Service picks the largest photo (highest `file_size`).
3. Fetches the file path via Telegram `getFile` API.
4. Downloads the image, compresses to WebP (quality 70) via Sharp.
5. Stores base64 data URI in MongoDB.
6. Auto-deletes the Telegram message after 15 seconds.
7. Supports `delete <id>` text command to remove an archive.

**Model:** `archives`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| schema | String | Yes | Namespace (default: 'geduma') |
| userName | String | Yes | Telegram @username |
| backupDate | Number | Yes | Unix timestamp |
| filePath | String | Yes | Path on Telegram CDN |
| textMessage | String | No | Caption or text with the photo |
| screenShotData | String | Yes | Base64 WebP data URI |

**Database:** `SCREENSHOT_BACKUP_MONGODB_URI` (dedicated MongoDB on Atlas)

---

## 4. Technical Architecture

### 4.1 Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express 4.21 |
| Databases | MongoDB Atlas (×5, via Mongoose 7) |
| Cache / Token Store | Upstash Redis (Serverless) |
| Auth | JWT (jsonwebtoken) |
| Image Processing | Sharp (WebP compression) |
| Scheduling | node-cron |
| UUID | uuid v13 |

### 4.2 Architecture Diagram

```
Client / Telegram
      │
      ▼
  Express (index.js)
      │
      ├── morgan (logging)
      ├── cors
      ├── express.json
      │
      ▼
  main.router.js
      │
      ├── /auth                  → Geduma Auth module
      ├── /config-manager        → Config Manager module
      ├── /short-url             → Short URL module
      ├── /snippet-vault         → Snippet Vault module
      ├── /screenshot-backup     → Screenshot Backup module
      │
      ▼
  Security Interceptor (JWT + Redis validation)
      │
      ▼
  Mongoose ──→ 5 MongoDB Atlas databases
  Upstash ───→ Redis (token storage)
```

### 4.3 Authentication Architecture

```yaml
Token lifecycle:
  1. Client POST /auth with { name, user, key } → server validates API key
  2. Server signs JWT { data, jti (uuid) } with module-specific secret, 5min expiry
  3. Server stores jti → token in Upstash Redis
  4. Client uses JWT in Authorization header for protected requests
  5. verify() middleware:
     a. Decodes JWT to extract jti
     b. Checks Redis for jti → token match
     c. Verifies JWT signature
     d. DELETES jti from Redis (single-use)
     e. Calls next() if valid, 401 if not
  6. Daily cron job (midnight) flushes all Redis keys
```

### 4.4 Global Middleware

- `morgan('dev')` — request logging
- `express.json()` — JSON body parsing
- `cors()` — cross-origin support
- `validateEnv()` — checks required env vars at startup (see `.env.example`)

---

## 5. Environment Variables

See `.env.example` for full list. Required vars are validated by `src/env-check.js`:

| Variable | Module | Required |
|----------|--------|----------|
| `PORT` | Global | No (defaults to 3000) |
| `API_SHORT_URL_KEY` | Short URL | Yes |
| `API_SHORT_URL_TOKEN_SECRET` | Short URL | Yes |
| `API_SNIPPET_VAULT_KEY` | Snippet Vault | Yes |
| `API_SNIPPET_VAULT_TOKEN_SECRET` | Snippet Vault | Yes |
| `API_SCREENSHOT_BACKUP_KEY` | Screenshot Backup | Yes |
| `API_SCREENSHOT_BACKUP_TOKEN_SECRET` | Screenshot Backup | Yes |
| `SNIPPET_VAULT_GITHUB_CLIENT_ID` | Snippet Vault | Yes |
| `SNIPPET_VAULT_GITHUB_CLIENT_SECRET` | Snippet Vault | Yes |
| `GEDUMA_AUTH_MONGODB_URI` | Auth | Yes* |
| `SHORT_URL_MONGODB_URI` | Short URL | Yes |
| `CONFIG_MANAGER_MONGODB_URI` | Config Manager | Yes |
| `SNIPPET_VAULT_MONGODB_URI` | Snippet Vault | Yes |
| `SCREENSHOT_BACKUP_MONGODB_URI` | Screenshot Backup | Yes |
| `UPSTASH_REDIS_REST_URL` | Security | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Security | Yes |
| `TELEGRAM_SCREENSHOT_BACKUP_BOT_TOKEN` | Screenshot Backup | Yes |

*\* `GEDUMA_AUTH_MONGODB_URI` is not in the current env-check list — potential gap.*

---

## 6. Infrastructure

- **Hosting:** Single Node.js process.
- **Databases:** 5 MongoDB Atlas clusters/DBs (one per module).
- **Cache:** Upstash Redis (REST-based, serverless).
- **Auth Frontend:** `https://auth.geduma.com` (external, not part of this API).
- **Telegram:** Bot webhook receives photos; uses Telegram File API for download.
- **Deployment:** Standard Node.js deployment via `npm start`.

---

## 7. Security Considerations

- API keys are hardcoded per module in `security.interceptor.js`.
- The `config-manager` module has `null` API key and secret — no auth protection for configurations.
- JWT tokens are single-use (deleted from Redis on first `verify()` call).
- Redis `flushdb` runs daily — all tokens are invalidated regardless of expiry.
- No rate limiting is currently implemented.
- No input sanitization or request validation is applied beyond Mongoose schema validation.
- The `telegram.service.js` `sendMessage` has a bug: `body` is an object, not JSON-stringified (will fail).

---

## 8. Known Issues & Technical Debt

1. **sendMessage bug** (`telegram.service.js:59`): `body` is passed as a JS object instead of `JSON.stringify()` — the Telegram API will reject it.
2. **Auth MongoDB URI not validated** (`env-check.js`): `GEDUMA_AUTH_MONGODB_URI` is missing from the required vars list.
3. **Missing module in README:** Short URL, Geduma Auth, and Screenshot Backup endpoints are undocumented.
4. **Hardcoded auth redirect** (`geduma-auth.routes.js:12`): `?id=12345` is a placeholder.
5. **`security.verify` commented out** on `POST /auth/set-provider` — the route is unauthenticated despite the intent.
6. **Config Manager has no auth** — `apiKeys['config-manager']` and `apiSecrets['config-manager']` are both `null`, meaning `security.auth()` will fail (key mismatch) for config-manager.
7. **Imports path typo** in `src/jobs/index.js:2`: `'..//interceptors/...'` has a double slash (works due to path resolution but is inconsistent).
8. **No tests** — no test framework or test files are present.

---

## 9. Future Roadmap (Potential)

- Add rate limiting (express-rate-limit or similar).
- Add input validation middleware (Joi or Zod).
- Expose GitHub OAuth routes for Snippet Vault login.
- Add CRUD endpoints for Snippet Vault (create, update, delete).
- Add URL analytics for Short URL (click tracking).
- Add delete endpoints for Config Manager.
- Add WebP-to-PNG conversion option for Screenshot Backup reports.
- Migrate to TypeScript for type safety.
- Add integration tests and CI pipeline.
- Containerize with Docker for consistent deployments.
