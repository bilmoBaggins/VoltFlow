# Fleet Charging — Cost Recording & Reimbursement

How to implement the ideas in `fleetcharging.md` using **EV service** (battery + fake location) + **Grid API** (price by region).

---

## What fleetcharging.md is saying

| Idea from the video | Meaning in VoltFlow |
| :--- | :--- |
| Sessions at **home / depot / public** | Every charge is a **ChargingSession** with `siteType` |
| Know **who, where, what it costs** | Session stores driver, vehicle, kWh, £ cost |
| **Home** → reimburse drivers | Driver paid the bill → company owes them |
| **Depot / public** → track in one place | Company cost (no driver reimbursement) |

---

## Who pays? (this is the whole reimbursement rule)

| Site | Who pays the electricity? | Record cost? | Reimburse driver? |
| :--- | :--- | :--- | :--- |
| **home** | Driver (home meter) | Yes | **Yes** — company → driver |
| **depot** | Company | Yes | No |
| **public** | Company (or card) | Yes | Usually no (or expense claim stretch) |

**Reimbursement only applies to `siteType: "home"`.**

---

## Data you already have

From **EV service** during a charge:
- `vehicleId`, `batteryPercent` start/end (or kWh estimated)
- `location.gridRegion` (e.g. `C` = London)
- `siteType`: `home` | `depot` | `public`
- `status: "charging"` while session open

From **Grid API**:
- Agile `pencePerKwh` for that `gridRegion` at session time (or average over the session)

---

## ChargingSession model (add this)

```json
{
  "id": "ses-1001",
  "vehicleId": "ev-01",
  "driverId": "drv-01",
  "siteType": "home",
  "location": {
    "lat": 51.5,
    "lng": -0.12,
    "label": "Driver home",
    "gridRegion": "C"
  },
  "startedAt": "2026-07-24T23:30:00Z",
  "endedAt": "2026-07-25T05:30:00Z",
  "batteryStartPercent": 22,
  "batteryEndPercent": 80,
  "energyKwh": 28.5,
  "pricePencePerKwh": 12.4,
  "costGbp": 3.53,
  "currency": "GBP",
  "costStatus": "calculated",
  "reimbursement": {
    "required": true,
    "status": "pending",
    "amountGbp": 3.53,
    "approvedAt": null,
    "paidAt": null
  }
}
```

### Field rules
| Field | How to set |
| :--- | :--- |
| `energyKwh` | Prefer meter/sim kWh. Simple fake: `(batteryEnd - batteryStart) / 100 * batteryCapacityKwh` (e.g. capacity 60) |
| `pricePencePerKwh` | From Grid API for `location.gridRegion` (avg of half-hours during session, or price at start) |
| `costGbp` | `energyKwh * (pricePencePerKwh / 100)` |
| `reimbursement.required` | `true` only if `siteType === "home"` |
| `reimbursement.amountGbp` | Same as `costGbp` for home (MVP) |

---

## Cost recording flow

```
1. Session START
   - vehicle status → charging
   - save batteryStartPercent, startedAt, siteType, location

2. While charging
   - EV sim raises battery %
   - (optional) sample grid price each half-hour

3. Session END
   - batteryEndPercent, endedAt
   - compute energyKwh
   - fetch/average grid price for gridRegion
   - compute costGbp
   - if home → create reimbursement pending
   - if depot/public → reimbursement.required = false
```

### Simple energy formula (beginner MVP)
```text
energyKwh = (batteryEndPercent - batteryStartPercent) / 100 * BATTERY_CAPACITY_KWH
```
Use `BATTERY_CAPACITY_KWH=60` (or per-vehicle field on EV).

### Simple cost formula
```text
costGbp = energyKwh * pricePencePerKwh / 100
```

---

## Reimbursement flow (home only)

```
pending → approved → paid
              ↘ rejected (optional)
```

| Status | Meaning | Who acts |
| :--- | :--- | :--- |
| `pending` | Session ended; waiting for fleet manager | System creates |
| `approved` | Manager OK’d the amount | Admin UI / API |
| `paid` | Marked reimbursed (demo: button, not real bank) | Admin UI / API |
| `not_required` | Depot/public | System |

### APIs (suggested)
```http
GET  /sessions
GET  /sessions/:id
POST /sessions/start     { vehicleId, driverId }
POST /sessions/:id/stop
POST /sessions/:id/reimbursement/approve
POST /sessions/:id/reimbursement/mark-paid
GET  /reimbursements?status=pending
```

### Start/stop can be driven by EV status
- When AI or user sets charge → `POST /sessions/start` with `siteType` from EV
- When battery target hit / status leaves `charging` → `POST /sessions/:id/stop` → auto cost + reimbursement

---

## UI features (fleet charging module)

1. **Sessions list** — who, vehicle, site, kWh, £, reimbursement badge  
2. **Filter** — Home / Depot / Public  
3. **Home reimbursement queue** — pending → Approve → Mark paid  
4. **Totals** — “This week: £X home reimbursements owed, £Y depot energy cost”

That matches the video: *one place for sessions + efficient home reimbursement*.

---

## How this ties to AI (optional but nice)

AI decides **when** to charge. Sessions record **what it cost** after charging.

| AI | Sessions / reimbursement |
| :--- | :--- |
| `CHARGE` at home overnight (cheap Agile) | Lower `costGbp` → smaller reimbursement |
| `WAIT` until price drops | Same kWh, less £ to reimburse |
| Dashboard tip | “Approve 3 pending home reimbursements (£12.40)” |

AI does **not** replace reimbursement — it helps reduce the amount.

---

## MVP vs later

### MVP (fit in your 1 month — Week 2–4)
- [ ] Session start/stop
- [ ] Cost from fake kWh + Grid region price
- [ ] Home → reimbursement `pending`
- [ ] Admin: approve + mark paid
- [ ] Sessions table on frontend

### Later (not required now)
- Real bank/payroll payout
- Driver app photo of home bill
- Public charger invoices / RFID
- Different reimbursement rate vs retail Agile (some fleets use a fixed p/kWh policy)

---

## Example numbers (demo)

Van A home charge, London region `C`:
- Battery 22% → 80%, capacity 60 kWh → **34.8 kWh**
- Avg Agile price **12.4 p/kWh**
- Cost = 34.8 × 0.124 = **£4.32**
- `reimbursement.status = pending`, amount **£4.32**
- Manager approves → paid  

Depot same charge → cost **£4.32** recorded, **no** reimbursement row.

---

## Owner split

| Role | Work |
| :--- | :--- |
| Backend | Session model, cost calc, reimbursement states |
| Data / Grid | Provide price for `gridRegion` at session time |
| EV / Backend | Start/stop hooks from charging status |
| Frontend | Sessions + reimbursement queue UI |
| QA | Postman: home gets reimbursement; depot does not |
| PO | Demo script: “home charge → pending → paid” |
| AI | Optional: prefer cheap windows to lower reimbursement |

---

## One-line rule for interns

> **Record cost for every session. Reimburse the driver only when `siteType` is `home`.**
