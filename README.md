# Geduma API

**Base URL:** `https://api.geduma.com`

All responses follow `{ ok: boolean, msg: string, data: any }` format.
Empty result sets return HTTP 204.

---

## Config Manager

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/config-manager/` | No | Health check |
| GET | `/config-manager/all` | No | List all configurations |
| GET | `/config-manager/owner/:owner` | No | Filter by owner |
| GET | `/config-manager/schema/:owner/:schema` | No | Filter by owner + schema |
| GET | `/config-manager/name/:owner/:schema/:name` | No | Get by owner + schema + name |
| POST | `/config-manager` | No | Create `{ owner, schema, name, value, expiration }` |
| PUT | `/config-manager/name/:owner/:schema/:name` | No | Update value/expiration |
| DELETE | `/config-manager/name/:owner/:schema/:name` | No | Delete configuration |

---

## Short URL

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/short-url/` | No | Health check |
| GET | `/short-url/:id` | No | Lookup URL by short code |
| POST | `/short-url/short` | JWT | Create short URL (project = 'default') |
| POST | `/short-url/short-by-project` | JWT | Create short URL scoped to a project |

---

## Snippet Vault

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/snippet-vault/` | No | Health check |
| GET | `/snippet-vault/all` | No | List all snippets |
| GET | `/snippet-vault/group/:group` | No | Filter by group |
| GET | `/snippet-vault/:id` | No | Get by ID |
| POST | `/snippet-vault` | No | Create `{ group, title, description, snippetValue, tags? }` |
| PUT | `/snippet-vault/:id` | No | Update snippet |
| DELETE | `/snippet-vault/:id` | No | Delete snippet |
