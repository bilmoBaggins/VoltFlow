# MySQL setup (Docker) — VoltFlow

Fake EV currently uses JSON in memory. Use this MySQL box when you want real tables for vehicles, sessions, and reimbursements.

## What you need

1. **Docker Desktop** (Windows/Mac) or **Docker Engine + Compose** (Linux)  
   - https://www.docker.com/products/docker-desktop/  
2. Confirm it works:
```bash
docker --version
docker compose version
```

## Start MySQL

From the **repo root** (`FleetManagmentEV`):

```bash
# optional: copy env defaults
cp .env.example .env

docker compose up -d
```

Wait until healthy (~20–40s), then check:

```bash
docker compose ps
docker compose logs mysql --tail 30
```

## Connection details (defaults)

| Setting | Value |
| :--- | :--- |
| Host | `127.0.0.1` |
| Port | `3307` (host) → `3306` inside container |
| Database | `voltflow` |
| User | `voltflow` |
| Password | `voltflow` |
| Root password | `voltflow_root` |

**Connection URL (for tools / ORMs):**
```text
mysql://voltflow:voltflow@127.0.0.1:3307/voltflow
```

## What’s created automatically

On **first** start, `docker/mysql/init/01-schema.sql` creates:

- `vehicles` (seeded with `ev-01` … `ev-05`)
- `charging_sessions`
- `reimbursements`

Data is stored in Docker volume `voltflow_mysql_data` (survives restarts).

## Useful commands

```bash
# Stop (keep data)
docker compose stop

# Start again
docker compose start

# Stop + remove containers (keep volume/data)
docker compose down

# Wipe database completely (delete volume)
docker compose down -v

# Open MySQL CLI inside the container
docker compose exec mysql mysql -uvoltflow -pvoltflow voltflow
```

Inside MySQL:
```sql
SHOW TABLES;
SELECT id, name, battery_percent, status, grid_region FROM vehicles;
```

## GUI clients (optional)

- MySQL Workbench  
- DBeaver  
- VS Code / Cursor “Database” / SQLTools extension  

Use the connection details above.

## Prisma (Laravel-style migrations)

Schema + migrations live in `apps/api/prisma/`.

```bash
# 1) MySQL must be running
docker compose up -d

# 2) API env
cd apps/api
cp .env.example .env   # if needed

# 3) Generate client + apply migrations + seed
npm install
npm run prisma:generate
npm run db:setup
``` 

### Everyday commands (from `apps/api`)

| Command | Like Laravel | What it does |
| :--- | :--- | :--- |
| `npm run prisma:migrate:dev` | `artisan migrate` (dev) | Create/apply new migrations |
| `npm run prisma:migrate` | `artisan migrate` (prod) | Apply pending migrations |
| `npm run prisma:seed` | `db:seed` | Upsert 5 vans |
| `npm run prisma:studio` | Tinker/UI | Browse tables in browser |
| `npm run db:setup` | migrate + seed | First-time / reset helper |

### Add a new change (example)

1. Edit `apps/api/prisma/schema.prisma`  
2. Run:
```bash
cd apps/api
npx prisma migrate dev --name add_driver_id
```
3. Commit the new folder under `prisma/migrations/`

The Fake EV API loads vehicle templates from MySQL via Prisma (falls back to `data/vehicles.json` if DB is down).

## Wire to the API

Already wired: `apps/api/src/db.js` + `dataStore.js` use Prisma.

`DATABASE_URL` example:
```text
mysql://voltflow:voltflow@127.0.0.1:3307/voltflow
```

## Troubleshooting

| Problem | Fix |
| :--- | :--- |
| Port 3307 in use | Change host port in `docker-compose.yml` (e.g. `"3308:3306"`) and update `MYSQL_PORT` / `DATABASE_URL` |
| Init SQL didn’t run | Init runs **only on empty volume**. Use `docker compose down -v` then `up -d` again |
| Tables already existed before Prisma | `npx prisma migrate resolve --applied 20260813190000_init` |
| `docker` not found | Install / start Docker Desktop, reopen terminal |
| Auth failed | Check `.env` matches compose env; defaults are `voltflow` / `voltflow` |
| Prisma can’t connect | Confirm `docker compose ps` healthy and `DATABASE_URL` uses port **3307** |
