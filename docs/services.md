# VoltFlow — Services & Architecture Plan

**Principle for this internship:** Prefer a **monorepo + modular API** over many microservices. Beginners ship faster when there is one backend to run, with clear folders (“services” as modules).

---

## Recommended shape

```
FleetManagmentEV/                          # monorepo
├── apps/
│   ├── web/                               # Frontend (Vercel)
│   └── api/                               # Backend API (Render)
│       └── src/
│           ├── modules/
│           │   ├── ev/                    # 1. EV service
│           │   ├── grid/                  # 2. Grid service
│           │   ├── sessions/              # 3. Charging sessions + reimbursement
│           │   ├── ai/                    # 4. AI service
│           │   ├── auth/                  # 5. Auth module
│           │   └── webhooks/              # 6. n8n outbound
│           └── realtime/                  # WebSocket or SSE
├── packages/
│   └── shared/                            # Shared TypeScript types/contracts
└── docs/
```

**Deploy only 2 apps:** `web` + `api`.  
**External (not built by us):** LLM provider, n8n, optional vector DB.

---

## Your 3 ideas — keep them

| # | You said | We call it | Responsibility |
| :--- | :--- | :--- | :--- |
| 1 | EV service gives EV data | **EV module** | 5 vehicles, battery %, **fake location**, telemetry tick, list/get, stream |
| 2 | Monorepo back + frontend | **apps/api + apps/web** | One repo, two deployables |
| 3 | API from grid | **Grid module** | Carbon + Octopus price (+ mocks) |

---

## What else to add (yes — these)

### 4. Sessions service (module) — must have
Implements `fleetcharging.md`: **cost recording** + **home reimbursement**.  
Uses EV (battery, siteType, location) + Grid (region price). **Not** a real charger hardware API.

| Owns | Endpoints |
| :--- | :--- |
| Start / stop charging session | `POST /sessions/start`, `POST /sessions/:id/stop` |
| List / get sessions | `GET /sessions`, `GET /sessions/:id` |
| Cost calculation (kWh × price) | on stop |
| Home reimbursement workflow | approve / mark-paid (see API surface below) |
| Pending reimbursement queue | `GET /reimbursements?status=pending` |

**Business rules**
- Record £ cost for **every** session (home / depot / public)
- Reimburse driver **only** when `siteType === "home"`
- Depot / public → cost only, `reimbursement.required = false`

See `fleetChargingCostAndReimbursement.md` for formulas and payload shape.

### 5. AI service (module) — must have
EV + grid alone do not make the product “AI”.

| Owns | Endpoints (example) |
| :--- | :--- |
| Charge decision agent | `POST /ai/decide` |
| JSON schema validation + retries | — |
| Token/usage log | `GET /ai/usage` (optional) |
| Mock mode for CI | `AI_MOCK=true` |
| Stretch: RAG ask | `POST /ai/ask` |

### 6. Auth module — must have (lite)
| Owns | Endpoints |
| :--- | :--- |
| Demo login + JWT | `POST /auth/login` |
| Protect vehicles, sessions, AI routes | middleware |

### 7. Realtime layer — must have
Not a separate deployable service — part of `api`.

| Owns | Endpoint |
| :--- | :--- |
| Push battery updates | `WS /stream` or `SSE /events` |

Owned by **Data/Realtime** + **Backend**.

### 8. Webhooks / Automation bridge — should have
| Owns | Behaviour |
| :--- | :--- |
| On AI `CHARGE`, POST to n8n | `N8N_WEBHOOK_URL` in `.env` |
| Optional: notify on reimbursement approved | stretch |
| Never crash API if n8n is down | log + continue |

n8n itself stays **external**.

### 9. Shared contracts package — should have
`packages/shared` with:

- `Vehicle` type  
- `ChargingSession` type  
- `Reimbursement` type  
- `ChargeDecision` type  
- Tick rules constants  
- Env var names documented  

Stops FE/BE/AI arguing about field names.

### 10. Frontend app — already in your monorepo
Not a “service,” but a first-class app:

- Fleet table  
- Charts  
- Ask AI  
- Sessions list + cost  
- Home reimbursement queue  
- Login  

### Optional later (stretch — not Week 1 services)
| Idea | Why wait |
| :--- | :--- |
| Separate Grid microservice | Extra deploy/ops for beginners |
| Separate AI microservice | Network complexity; keep in `api` for MVP |
| OpenChargeMap module | Stretch epic E13 |
| Vector DB (Qdrant/Pinecone) | Only if RAG epic is green-lit |
| Message queue (Rabbit/Kafka) | Overkill for 5 fake cars |

---

## Service map (logical)

```
                 ┌─────────────┐
                 │  apps/web   │
                 │  Dashboard  │
                 └──────┬──────┘
                        │ HTTP + SSE/WS
                        ▼
                 ┌──────────────────────────────────────────────┐
                 │                 apps/api                     │
                 │  ┌──────┐  ┌────┐  ┌──────┐  ┌──────────┐  │
                 │  │ auth │  │ ev │  │ grid │  │ sessions │  │
                 │  └──┬───┘  └─┬──┘  └──┬───┘  └────┬─────┘  │
                 │     │        │        │           │         │
                 │     │   ┌────▼────────▼──┐        │         │
                 │     │   │    realtime    │        │         │
                 │     │   └────────┬───────┘        │         │
                 │     │            │   uses price   │         │
                 │     │            │   on session   │◄────────┤
                 │     │            │   stop         │         │
                 │     │       ┌────▼────┐           │         │
                 │     └──────►│   ai    │           │         │
                 │             └────┬────┘           │         │
                 │                  │                │         │
                 │             ┌────▼────┐           │         │
                 │             │webhooks │           │         │
                 │             └────┬────┘           │         │
                 └──────────────────┼──────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
        National Grid         Octopus Agile           LLM API
        Carbon API            (or mock)               (OpenAI/Claude)
                                    │
                                    ▼
                                   n8n  ──► Discord/email
```

**Session flow:** `ev` (start/stop battery) + `grid` (region price) → `sessions` (cost + reimbursement) → `web` UI.

---

## API surface (by module)

### EV
- `GET /vehicles`
- `GET /vehicles/:id`
- `GET /vehicles/:id/telemetry`
- `PATCH /vehicles/:id/status` (demo control)
- Stream: `GET /events` (SSE) or `WS /stream`

Every EV payload includes **battery + fake location** (required):

```json
{
  "id": "ev-01",
  "name": "Van A",
  "batteryPercent": 62,
  "status": "idle",
  "siteType": "depot",
  "location": {
    "lat": 51.5074,
    "lng": -0.1278,
    "label": "London Depot",
    "postcode": "SW1A 1AA",
    "gridRegion": "C"
  }
}
```

| Field | Purpose |
| :--- | :--- |
| `batteryPercent` | SoC for AI urgency |
| `siteType` | home / depot / public |
| `location.lat/lng` | Fake GPS for map + nearby chargers (stretch) |
| `location.gridRegion` | Which Octopus region price to fetch (`C` = London) |

**Seed idea:** put vans in different UK spots (e.g. London `C`, Manchester `G`, Glasgow `N`) so AI can use **that van’s region price**, not one global price.

### Grid
- `GET /grid/carbon`
- `GET /grid/price`
- `GET /grid/snapshot`  ← AI + charts + session cost use this

### Sessions (charging + reimbursement)
- `POST /sessions/start` — body: `{ vehicleId, driverId }` (siteType/location from EV)
- `POST /sessions/:id/stop` — compute kWh, fetch region price, set `costGbp`
- `GET /sessions` — list (filter by siteType optional)
- `GET /sessions/:id`
- `GET /reimbursements?status=pending`
- `POST /sessions/:id/reimbursement/approve` — home only
- `POST /sessions/:id/reimbursement/mark-paid` — home only

On **stop**, MVP formulas:
```text
energyKwh = (batteryEnd% - batteryStart%) / 100 * BATTERY_CAPACITY_KWH
costGbp   = energyKwh * (pricePencePerKwh / 100)
```
If `siteType === "home"` → create reimbursement `{ required: true, status: "pending", amountGbp: costGbp }`.

Example session (home):
```json
{
  "id": "ses-1001",
  "vehicleId": "ev-01",
  "driverId": "drv-01",
  "siteType": "home",
  "energyKwh": 28.5,
  "pricePencePerKwh": 12.4,
  "costGbp": 3.53,
  "reimbursement": {
    "required": true,
    "status": "pending",
    "amountGbp": 3.53
  }
}
```

### AI
- `POST /ai/decide`
- `GET /ai/usage` (optional)
- `POST /ai/ask` (stretch RAG)

### Auth
- `POST /auth/login`
- `GET /health` (public)

### Internal / config
- Env: `TICK_MS`, `BATTERY_CAPACITY_KWH`, `JWT_SECRET`, `OPENAI_API_KEY`, `OCTOPUS_*`, `N8N_WEBHOOK_URL`, `AI_MOCK`

---

## Who owns what

| Module / app | Primary role | Backup pair |
| :--- | :--- | :--- |
| Monorepo / CI / deploy | DevOps | Backend |
| `ev` + seed data | Backend | Data/Realtime |
| `realtime` stream | Data/Realtime | Backend |
| `grid` | Data/Realtime | Automation |
| `sessions` + reimbursement | Backend | Frontend (UI) + QA |
| `ai` | AI Engineer | Backend |
| `auth` | Backend | DevOps |
| `webhooks` | Automation | AI |
| `apps/web` | Frontend | QA (acceptance) |
| `packages/shared` | Backend + AI | Frontend |
| Postman / OpenAPI | QA | Backend |

---

## Decision: modular monolith vs microservices

| Approach | Verdict for this project |
| :--- | :--- |
| **One API, modules inside** (recommended) | Best for beginners, 1-month deadline, shared DB/memory |
| Split EV / Grid / AI into 3 deployable services | Only if mentor insists on “microservices practice” — adds week of ops pain |
| Frontend separate repo | No — keep monorepo |

**PM decision:** Ship as **modular monolith in a monorepo**. Name folders “services/modules” so interns still learn service boundaries without Kubernetes.

---

## Week 1 build order (still parallel)

| Day | Service/app work |
| :--- | :--- |
| 1–2 | Monorepo scaffold (`web` + `api` + `shared`) |
| 2–3 | Freeze contracts in `packages/shared` (Vehicle, Session, ChargeDecision) |
| 3–5 | EV module: seed + `GET /vehicles` |
| 3–5 | Web: mock fleet UI; Grid: mock JSON; AI: schema fixtures; Sessions: stub types |
| 5–7 | Wire FE → real EV API; hello deploy |

- Grid **live** + AI **LLM**: Sprint 3  
- **Sessions start/stop + reimbursement**: Sprint 2–3 (after EV list works)  
- Week 1: still create `modules/sessions` folder + shared types (parallel OK)

---

## Summary answer

| Keep | Add |
| :--- | :--- |
| 1. EV service | 4. **Sessions + reimbursement** |
| 2. Monorepo web + api | 5. AI module |
| 3. Grid API module | 6. Auth (JWT lite) |
| | 7. Realtime (SSE/WS inside api) |
| | 8. Webhooks → n8n |
| | 9. Shared types package |

That is the full service plan for launch — nothing else required for the prototype.
