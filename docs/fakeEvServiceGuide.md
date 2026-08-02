# How to Create a Dummy Fake EV Service (Node.js)

Beginner guide: build a **fake EV API** with **Express**, **Swagger / OpenAPI**, and a **Postman collection** you can import.

**Stack:** Node.js + Express + swagger-ui-express  
**Matches:** `docs/services.md` EV contract (battery % + fake location)

---

## What you will build

| Endpoint | Purpose |
| :--- | :--- |
| `GET /health` | API is up |
| `GET /vehicles` | List 5 fake EVs |
| `GET /vehicles/:id` | One EV |
| `GET /vehicles/:id/telemetry` | Latest battery snapshot |
| `PATCH /vehicles/:id/status` | Demo control (`idle` / `charging` / `driving`) |
| `GET /api-docs` | Swagger UI |

Optional later: SSE/WebSocket stream (see end of this doc).  
**Default behaviour:** every HTTP request returns **new random** battery/status/temp (same 5 vehicle ids).

---

## 1. Create the folder

From the monorepo root (or standalone for practice):

```bash
mkdir -p apps/api
cd apps/api
npm init -y
npm install express cors swagger-ui-express yamljs
npm install -D nodemon
```

Add scripts to `package.json`:

```json
{
  "name": "voltflow-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

Folder layout:

```text
apps/api/
├── package.json
├── openapi.yaml
├── data/
│   └── vehicles.json
└── src/
    ├── index.js
    ├── dataStore.js
    └── routes/
        └── vehicles.js
```

---

## 2. Seed fake EV data (`data/vehicles.json`)

```json
[
  {
    "id": "ev-01",
    "name": "Van A",
    "batteryPercent": 62,
    "chargeRateKw": 0,
    "status": "idle",
    "temperatureC": 31,
    "siteType": "depot",
    "batteryCapacityKwh": 60,
    "location": {
      "lat": 51.5074,
      "lng": -0.1278,
      "label": "London Depot",
      "postcode": "SW1A 1AA",
      "gridRegion": "C"
    },
    "updatedAt": "2026-07-24T12:00:00.000Z"
  },
  {
    "id": "ev-02",
    "name": "Van B",
    "batteryPercent": 41,
    "chargeRateKw": 7.2,
    "status": "charging",
    "temperatureC": 29,
    "siteType": "home",
    "batteryCapacityKwh": 60,
    "location": {
      "lat": 51.52,
      "lng": -0.1,
      "label": "Driver home",
      "postcode": "E1 6AN",
      "gridRegion": "C"
    },
    "updatedAt": "2026-07-24T12:00:00.000Z"
  },
  {
    "id": "ev-03",
    "name": "Van C",
    "batteryPercent": 22,
    "chargeRateKw": 0,
    "status": "idle",
    "temperatureC": 28,
    "siteType": "depot",
    "batteryCapacityKwh": 75,
    "location": {
      "lat": 53.4808,
      "lng": -2.2426,
      "label": "Manchester Depot",
      "postcode": "M1 1AE",
      "gridRegion": "G"
    },
    "updatedAt": "2026-07-24T12:00:00.000Z"
  },
  {
    "id": "ev-04",
    "name": "Van D",
    "batteryPercent": 88,
    "chargeRateKw": 0,
    "status": "driving",
    "temperatureC": 33,
    "siteType": "public",
    "batteryCapacityKwh": 60,
    "location": {
      "lat": 55.8642,
      "lng": -4.2518,
      "label": "Glasgow route",
      "postcode": "G1 1XQ",
      "gridRegion": "N"
    },
    "updatedAt": "2026-07-24T12:00:00.000Z"
  },
  {
    "id": "ev-05",
    "name": "Van E",
    "batteryPercent": 55,
    "chargeRateKw": 0,
    "status": "idle",
    "temperatureC": 30,
    "siteType": "depot",
    "batteryCapacityKwh": 60,
    "location": {
      "lat": 51.4545,
      "lng": -2.5879,
      "label": "Bristol Depot",
      "postcode": "BS1 4DJ",
      "gridRegion": "L"
    },
    "updatedAt": "2026-07-24T12:00:00.000Z"
  }
]
```

---

## 3. Data store (`src/dataStore.js`) — random on every request

**Goal:** each `GET` returns fresh random-ish values (still the same 5 vans / ids).

Fixed fields stay stable: `id`, `name`, `batteryCapacityKwh`, base `location` label/region.  
Random each request: `batteryPercent`, `status`, `chargeRateKw`, `temperatureC`, small GPS jitter, `updatedAt`.

```js
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vehiclesPath = join(__dirname, "../data/vehicles.json");

/** Seed templates (ids / names / home regions stay fixed). */
const templates = JSON.parse(readFileSync(vehiclesPath, "utf8"));

const STATUSES = ["idle", "charging", "driving"];
const SITE_TYPES = ["depot", "home", "public"];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/** Build one randomized snapshot from a template. */
function randomizeVehicle(template) {
  const status = pick(STATUSES);
  const siteType = pick(SITE_TYPES);

  // Tiny GPS jitter so map pins move slightly (~±0.01 degrees)
  const lat = Number((template.location.lat + (Math.random() - 0.5) * 0.02).toFixed(5));
  const lng = Number((template.location.lng + (Math.random() - 0.5) * 0.02).toFixed(5));

  return {
    ...template,
    batteryPercent: randInt(5, 98),
    status,
    chargeRateKw: status === "charging" ? Number((3 + Math.random() * 8).toFixed(1)) : 0,
    temperatureC: randInt(18, 40),
    siteType,
    location: {
      ...template.location,
      lat,
      lng,
    },
    updatedAt: new Date().toISOString(),
  };
}

/** NEW random values every call. */
export function getVehicles() {
  return templates.map(randomizeVehicle);
}

export function getVehicleById(id) {
  const template = templates.find((v) => v.id === id);
  if (!template) return null;
  return randomizeVehicle(template);
}

/**
 * Demo control: return a randomized vehicle forced to a given status.
 * Still random battery/temp — only status (and chargeRate) is forced.
 */
export function updateVehicleStatus(id, status) {
  const template = templates.find((v) => v.id === id);
  if (!template) return null;

  const allowed = ["idle", "charging", "driving"];
  if (!allowed.includes(status)) {
    return { error: "Invalid status. Use idle | charging | driving" };
  }

  const vehicle = randomizeVehicle(template);
  vehicle.status = status;
  vehicle.chargeRateKw = status === "charging" ? Number((3 + Math.random() * 8).toFixed(1)) : 0;
  vehicle.updatedAt = new Date().toISOString();
  return vehicle;
}
```

### Optional: keep “rule-based” random (less chaotic)

If pure random feels too jumpy for demos, randomize **around** the last values instead — but for learning/Postman, **full random per request** is fine.

---

## 4. Routes (`src/routes/vehicles.js`)

Each handler calls `getVehicles` / `getVehicleById`, which **already randomize**:

```js
import { Router } from "express";
import {
  getVehicleById,
  getVehicles,
  updateVehicleStatus,
} from "../dataStore.js";

const router = Router();

router.get("/", (_req, res) => {
  // New random snapshot every request
  res.json(getVehicles());
});

router.get("/:id", (req, res) => {
  const vehicle = getVehicleById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  res.json(vehicle);
});

router.get("/:id/telemetry", (req, res) => {
  const vehicle = getVehicleById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

  res.json({
    vehicleId: vehicle.id,
    batteryPercent: vehicle.batteryPercent,
    chargeRateKw: vehicle.chargeRateKw,
    status: vehicle.status,
    temperatureC: vehicle.temperatureC,
    siteType: vehicle.siteType,
    location: vehicle.location,
    updatedAt: vehicle.updatedAt,
  });
});

router.patch("/:id/status", (req, res) => {
  const { status } = req.body || {};
  const result = updateVehicleStatus(req.params.id, status);

  if (!result) return res.status(404).json({ error: "Vehicle not found" });
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

export default router;
```

**Try it:** hit `GET /vehicles` twice in Postman — `batteryPercent` / `status` should differ each time.
---

## 5. OpenAPI file (`openapi.yaml`)

```yaml
openapi: 3.0.3
info:
  title: VoltFlow Fake EV Service
  description: Dummy EV fleet API for internship (no real vehicles).
  version: 1.0.0
servers:
  - url: http://localhost:3001
    description: Local API
paths:
  /health:
    get:
      summary: Health check
      responses:
        "200":
          description: OK
  /vehicles:
    get:
      summary: List all fake EVs
      responses:
        "200":
          description: Array of vehicles
  /vehicles/{id}:
    get:
      summary: Get one EV
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            example: ev-01
      responses:
        "200":
          description: Vehicle
        "404":
          description: Not found
  /vehicles/{id}/telemetry:
    get:
      summary: Latest telemetry snapshot
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Telemetry
        "404":
          description: Not found
  /vehicles/{id}/status:
    patch:
      summary: Set vehicle status (demo control)
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: string
                  enum: [idle, charging, driving]
      responses:
        "200":
          description: Updated vehicle
        "400":
          description: Bad status
        "404":
          description: Not found
```

---

## 6. Server (`src/index.js`)

```js
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vehiclesRouter from "./routes/vehicles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const openapi = YAML.load(join(__dirname, "../openapi.yaml"));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "voltflow-ev" });
});

app.use("/vehicles", vehiclesRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));

// No setInterval needed — getVehicles() randomizes on every request

app.listen(PORT, () => {
  console.log(`EV API http://localhost:${PORT}`);
  console.log(`Swagger  http://localhost:${PORT}/api-docs`);
});
```
---

## 7. Run it

```bash
cd apps/api
npm run dev
```

Open:
- API: http://localhost:3001/vehicles  
- Swagger: http://localhost:3001/api-docs  

Quick curl:

```bash
curl http://localhost:3001/vehicles
curl http://localhost:3001/vehicles/ev-01
curl -X PATCH http://localhost:3001/vehicles/ev-03/status \
  -H "Content-Type: application/json" \
  -d '{"status":"charging"}'
```

---

## 8. Postman — import JSON collection

### Option A — import our ready file

1. Open Postman  
2. **Import** → choose  
   `docs/postman/voltflow-ev-service.postman_collection.json`  
3. Set collection variable `baseUrl` = `http://localhost:3001`  
4. Send **List vehicles**

### Option B — create collection yourself

| Request | Method | URL |
| :--- | :--- | :--- |
| Health | GET | `{{baseUrl}}/health` |
| List vehicles | GET | `{{baseUrl}}/vehicles` |
| Get vehicle | GET | `{{baseUrl}}/vehicles/ev-01` |
| Telemetry | GET | `{{baseUrl}}/vehicles/ev-01/telemetry` |
| Set charging | PATCH | `{{baseUrl}}/vehicles/ev-03/status` body `{"status":"charging"}` |

### Export OpenAPI into Postman (alternative)

1. Postman → Import → `openapi.yaml`  
2. Postman builds requests from the OpenAPI paths  

---

## 9. QA checklist

- [ ] `GET /vehicles` returns **5** cars  
- [ ] Each car has `batteryPercent` + `location.gridRegion`  
- [ ] **Two requests in a row → different battery/status** (random per request)  
- [ ] Unknown id → **404**  
- [ ] Bad status → **400**  
- [ ] Swagger UI loads at `/api-docs`  
- [ ] Postman collection all green

---

## 10. Who owns this (internship)

| Role | Task |
| :--- | :--- |
| Backend | Build Express routes + data store |
| DevOps | `npm` scripts, port, `.env.example` (`PORT=3001`) |
| QA | Postman collection + status codes |
| Frontend | Call `GET /vehicles` on admin dashboard |
| Data/Realtime | Later: SSE stream that pushes a new `getVehicles()` snapshot on an interval |

---

## 11. Next steps (after this works)

1. Add `GET /events` (SSE) that pushes vehicles every tick  
2. Add **sessions** module (start/stop + cost) — see `fleetChargingCostAndReimbursement.md`  
3. Add **grid** module (`/grid/snapshot`) — see `gridApiNotes.md`  
4. Protect routes with JWT (Week 4)

---

## Common beginner mistakes

| Mistake | Fix |
| :--- | :--- |
| Port in use | Change `PORT=3001` or kill old process |
| CORS errors from web app | Keep `app.use(cors())` |
| `require` vs `import` | This guide uses `"type": "module"` |
| Postman hits wrong port | Check `baseUrl` variable |
| Battery never changes | Confirm `getVehicles()` calls `randomizeVehicle` every time |
