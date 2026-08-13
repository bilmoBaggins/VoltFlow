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

## Wire to the API (next step)

The Express Fake EV API does **not** read MySQL yet. When Backend is ready:

1. `npm install mysql2` in `apps/api`  
2. Read `MYSQL_*` from `.env`  
3. Replace / optionally dual-run JSON `dataStore` with SQL queries  

Until then, UI can keep using `http://localhost:3001/vehicles` as today.

## Troubleshooting

| Problem | Fix |
| :--- | :--- |
| Port 3307 in use | Change host port in `docker-compose.yml` (e.g. `"3308:3306"`) and update `MYSQL_PORT` |
| Init SQL didn’t run | Init runs **only on empty volume**. Use `docker compose down -v` then `up -d` again |
| `docker` not found | Install / start Docker Desktop, reopen terminal |
| Auth failed | Check `.env` matches compose env; defaults are `voltflow` / `voltflow` |
