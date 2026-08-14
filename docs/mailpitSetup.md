# Mailpit — local email catcher (dev only)

Mailpit catches SMTP email from your app so you can read it in a browser. Nothing is sent to real inboxes.

## Start

From repo root:

```bash
docker compose up -d mailpit
# or start everything:
docker compose up -d
```

## Open UI

**http://localhost:8025**

## SMTP settings (for the API later)

| Setting | Value |
| :--- | :--- |
| Host | `127.0.0.1` |
| Port | `1025` |
| Username | (any / none) |
| Password | (any / none) |
| Encryption | none |

Example `.env` for `apps/api`:

```env
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
MAIL_FROM=noreply@voltflow.local
```

## Port already in use?

If another project uses 1025/8025, set in repo-root `.env`:

```env
MAILPIT_SMTP_PORT=1026
MAILPIT_UI_PORT=8026
```

Then:

```bash
docker compose up -d --force-recreate mailpit
```

Use the new ports in the browser and SMTP config.

## Useful commands

```bash
docker compose ps mailpit
docker compose logs mailpit --tail 30
docker compose stop mailpit
```
